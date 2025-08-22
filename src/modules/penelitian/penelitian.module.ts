import { Module } from '@nestjs/common';
import { PenelitianService } from './penelitian.service';
import { PenelitianController } from './penelitian.controller';

@Module({
  controllers: [PenelitianController],
  providers: [PenelitianService],
})
export class PenelitianModule {}
