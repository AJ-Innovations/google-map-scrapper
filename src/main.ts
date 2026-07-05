import { env } from './config/env.validator';
import { logger } from './core/logger/Logger';
import { BrowserManager } from './core/browser/BrowserManager';

async function bootstrap() {
  logger.info(`Starting Lead Collection Platform`);
  logger.info(`Keyword: ${env.KEYWORD}`);
  logger.info(`Headless mode: ${env.HEADLESS}`);
  
  const browserManager = new BrowserManager();
  
  try {
    await browserManager.initialize();
    
    // Milestone 2 Test: Create context and page, take screenshot to ensure it works
    const context = await browserManager.createContext();
    const page = await browserManager.createPage(context);
    
    logger.info("Browser instantiated and page created successfully.");
    
    // Keep it minimal for milestone 2
    logger.info("Milestone 2 Completed Successfully.");
    
  } catch (error) {
    logger.error({ err: error }, "Failed to execute");
  } finally {
    await browserManager.close();
    logger.info("Graceful shutdown complete.");
  }
}

bootstrap();
