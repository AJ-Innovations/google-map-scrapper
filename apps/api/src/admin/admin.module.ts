import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { SettingsController } from './settings.controller';
import { AnalyticsController } from './analytics.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, SettingsController, AnalyticsController],
  providers: [],
})
export class AdminModule {}
