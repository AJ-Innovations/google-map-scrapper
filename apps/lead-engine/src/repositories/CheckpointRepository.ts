import prisma from './PrismaClient';
import { Prisma } from '@prisma/client';

export interface CheckpointData {
  jobId: string;
  lastProcessedUrl?: string;
  processedCount: number;
  failedCount: number;
  remainingCount: number;
  queueSnapshot: any;
  workerSnapshot: any;
}

export class CheckpointRepository {
  async save(data: CheckpointData, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.checkpoint.create({
      data: {
        jobId: data.jobId,
        lastProcessedUrl: data.lastProcessedUrl,
        processedCount: data.processedCount,
        failedCount: data.failedCount,
        remainingCount: data.remainingCount,
        queueSnapshot: data.queueSnapshot ? JSON.parse(JSON.stringify(data.queueSnapshot)) : null,
        workerSnapshot: data.workerSnapshot ? JSON.parse(JSON.stringify(data.workerSnapshot)) : null,
      }
    });
  }

  async getLatestCheckpoint(jobId: string) {
    return prisma.checkpoint.findFirst({
      where: { jobId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
