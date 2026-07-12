import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class WalletService {
  constructor(private readonly db: DatabaseService) {}

  async getWalletForUser(userId: string) {
    let wallet = await this.db.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      // Create a default wallet if it doesn't exist
      wallet = await this.db.wallet.create({
        data: {
          userId,
          balance: 0,
          totalSpent: 0,
        },
        include: {
          transactions: true,
        },
      });
    }

    return wallet;
  }
}
