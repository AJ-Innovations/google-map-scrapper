import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JobsService {
  constructor(private db: DatabaseService) {}

  async createJob(data: { keyword: string; location?: string; options?: any }) {
    return this.db.job.create({
      data: {
        keyword: data.keyword,
        provider: 'google-maps',
        location: data.location,
        options: data.options || {},
        status: 'QUEUED',
      },
    });
  }

  async getJobs() {
    return this.db.job.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJobById(id: string) {
    const job = await this.db.job.findUnique({
      where: { id },
      include: {
        businesses: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async cancelJob(id: string) {
    return this.db.job.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async retryJob(id: string) {
    const oldJob = await this.db.job.findUnique({ where: { id } });
    if (!oldJob) throw new NotFoundException('Job not found');

    return this.db.job.create({
      data: {
        keyword: oldJob.keyword,
        provider: oldJob.provider || 'google-maps',
        location: oldJob.location,
        options: oldJob.options || {},
        status: 'QUEUED',
      },
    });
  }
}
