import { Module } from '@nestjs/common';
import { PelaksanaanPendidikanService } from './pelaksanaan-pendidikan.service';
import { PelaksanaanPendidikanController } from './pelaksanaan-pendidikan.controller';

@Module({
  controllers: [PelaksanaanPendidikanController],
  providers: [PelaksanaanPendidikanService],
})
export class PelaksanaanPendidikanModule {}
