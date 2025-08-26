import { Module } from '@nestjs/common';
import { PenunjangService } from './penunjang.service';
import { PenunjangController } from './penunjang.controller';

@Module({
  controllers: [PenunjangController],
  providers: [PenunjangService],
})
export class PenunjangModule {}
