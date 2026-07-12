import { Job, ExtractionJob } from '@prisma/client';
import { BrowserFactory } from '../browser/BrowserFactory';
import { BrowserContextManager } from '../browser/BrowserContextManager';
import { GoogleMapsProvider } from '../../providers/google-maps/GoogleMapsProvider';
import { WorkerPool } from '../workers/WorkerPool';
import { MemoryQueue } from '@lead-platform/queue';
import { ExtractionJob } from '@lead-platform/types';
import { JobLogger } from './JobLogger';
import { PersistenceService } from '../../services/PersistenceService';
import { EventBus, EventTypes } from '../events/EventBus';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class JobExecutor {
  async execute(job: Job): Promise<boolean> {
    const jobLogger = new JobLogger(job.id);
    await jobLogger.info(`Starting execution for job ${job.id} (Keyword: ${job.keyword})`);
    
    const extractionQueue = new MemoryQueue<ExtractionJob>();
    const persistenceService = new PersistenceService(job.id);
    
    // Subscribe to extraction events just for this execution
    // Note: In a true daemon, we'd want to ensure EventBus doesn't leak listeners.
    // We will use a local listener function and unsubscribe it after.
    const onBusinessExtracted = async (extractedJob: any) => {
      if (!extractedJob || !extractedJob.data) return;
      
      const business = extractedJob.data;
      await persistenceService.queueForSave(business, {
        lastProcessedUrl: extractedJob.url,
        processedCount: 1,
        failedCount: 0,
        remainingCount: 0,
        queueSnapshot: [],
        workerSnapshot: {}
      });

      // Update real-time progress
      await prisma.job.update({
        where: { id: job.id },
        data: { processed: { increment: 1 } }
      });
    };
    
    EventBus.subscribe(EventTypes.BusinessExtracted, onBusinessExtracted);

    const browserManager = BrowserFactory.createBrowserManager();
    let success = false;
    
    try {
      // Extract options
      const options = (job.options as any) || {};
      const headless = options.headless !== undefined ? options.headless : true;
      const concurrency = options.concurrency || 3;
      const maxResults = options.maxResults;
      
      await jobLogger.info('Initializing browser...');
      const browser = await browserManager.initialize({ headless });
      const contextManager = new BrowserContextManager(browser);
      const context = await contextManager.createContext();
      
      const workerPool = new WorkerPool(extractionQueue, context, concurrency);
      
      await jobLogger.info(`Starting worker pool with concurrency ${concurrency}...`);
      workerPool.start();
      
      const mapsProvider = new GoogleMapsProvider(context, extractionQueue);
      
      await jobLogger.info('Launching provider...');
      await mapsProvider.launch();
      
      await jobLogger.info(`Searching for ${job.keyword} in ${job.location || 'Unknown'}`);
      await mapsProvider.search(job.keyword, job.location || "");
      await mapsProvider.collectUrls(maxResults); 
      
      // Wait for queue to drain
      while (await extractionQueue.size() > 0) {
        
        // Also check if the job was cancelled in the DB
        const currentJob = await prisma.job.findUnique({ select: { status: true }, where: { id: job.id } });
        if (currentJob?.status === 'CANCELLED') {
          await jobLogger.warn('Job was cancelled by user. Aborting...');
          success = false;
          break;
        }

        await new Promise(r => setTimeout(r, 2000));
      }
      
      if (success !== false) {
        success = true;
      }
      
      await jobLogger.info('Flushing persistence queue...');
      await persistenceService.flush({
        processedCount: 0, failedCount: 0, remainingCount: 0, queueSnapshot: [], workerSnapshot: {}
      });
      
      await workerPool.stop();
      await mapsProvider.cleanup();

      if (success) {
        // Calculate refunds
        const finalJob = await prisma.job.findUnique({ select: { processed: true, userId: true, keyword: true }, where: { id: job.id } });
        if (finalJob && finalJob.userId) {
           const processed = finalJob.processed;
           if (processed < maxResults) {
              const refundAmount = maxResults - processed;
              await jobLogger.info(`Job finished early. Refunding ${refundAmount} tokens to user.`);
              
              const wallet = await prisma.wallet.findUnique({ where: { userId: finalJob.userId } });
              if (wallet) {
                await prisma.$transaction([
                  prisma.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: { increment: refundAmount } }
                  }),
                  prisma.walletTransaction.create({
                    data: {
                      walletId: wallet.id,
                      amount: refundAmount,
                      type: 'JOB_REFUND',
                      description: `Refund for unused tokens (${refundAmount} leads) from Job: ${finalJob.keyword}`
                    }
                  })
                ]);
              }
           }
        }
        await jobLogger.info('Job completed successfully.');
      }
    } catch (error: any) {
      await jobLogger.error(`Execution failed: ${error.message}`);
      success = false;
    } finally {
      // EventBus listener will be cleaned up implicitly when process dies (fix later if needed)
      
      await browserManager.closeBrowser();
      await jobLogger.info('Browser closed.');
    }
    
    return success;
  }
}
