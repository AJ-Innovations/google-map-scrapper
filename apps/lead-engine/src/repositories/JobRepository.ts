import prisma from './PrismaClient';

export class JobRepository {
  async createJob(keyword: string, provider: string, location?: string): Promise<string> {
    const job = await prisma.job.create({
      data: {
        keyword,
        provider,
        location,
        status: 'RUNNING'
      }
    });
    return job.id;
  }

  async getUnfinishedJobs() {
    return prisma.job.findMany({
      where: {
        status: 'RUNNING'
      }
    });
  }

  async markComplete(jobId: string) {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' }
    });
  }
}
