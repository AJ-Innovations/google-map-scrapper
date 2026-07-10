import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DatabaseService } from '../database/database.service';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SettingsController {
  constructor(private db: DatabaseService) {}

  @Get()
  async getSettings() {
    return this.db.setting.findMany();
  }

  @Put()
  async updateSettings(@Body() body: { settings: { key: string; value: string }[] }) {
    for (const setting of body.settings) {
      await this.db.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }
    return { success: true };
  }
}
