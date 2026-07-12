import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  async getMyWallet(@Req() req: Request) {
    // req.user contains the decoded JWT (id, email, role)
    const user: any = req.user;
    return this.walletService.getWalletForUser(user.id);
  }
}
