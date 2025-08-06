import { Module } from '@nestjs/common';
import { PendidikanService } from './pendidikan.service';
import { PendidikanController } from './pendidikan.controller';

@Module({
  controllers: [PendidikanController],
  providers: [PendidikanService],
})
export class PendidikanModule { }
