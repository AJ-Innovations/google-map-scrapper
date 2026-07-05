import { z } from 'zod';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
  HEADLESS: z.enum(['true', 'false']).default('true'),
  KEYWORD: z.string().min(1, "KEYWORD is required"),
  MAX_RESULTS: z.string().transform(Number).default('50'),
  SCROLL_DELAY: z.string().transform(Number).default('1000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info')
});

export const env = envSchema.parse(process.env);
