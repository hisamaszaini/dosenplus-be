import { Module } from '@nestjs/common';
import { FakultasController } from './fakultas.controller';
import { FakultasService } from './fakultas.service';

@Module({
  imports: [
    FakultasModule
  ],
  controllers: [FakultasController],
  providers: [FakultasService]
})
export class FakultasModule {}
