import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  createJob(@Req() req: Request, @Body() body: { keyword: string; location?: string; options?: any }) {
    return this.jobsService.createJob(body);
  }

  @Get()
  getJobs(@Req() req: Request) {
    return this.jobsService.getJobs();
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Post(':id/cancel')
  cancelJob(@Param('id') id: string) {
    return this.jobsService.cancelJob(id);
  }

  @Post(':id/retry')
  retryJob(@Req() req: Request, @Param('id') id: string) {
    return this.jobsService.retryJob(id);
  }
}
