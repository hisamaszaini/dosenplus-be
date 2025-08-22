import { Module } from '@nestjs/common';
import { PengabdianService } from './pengabdian.service';
import { PengabdianController } from './pengabdian.controller';

@Module({
  controllers: [PengabdianController],
  providers: [PengabdianService],
})
export class PengabdianModule {}
