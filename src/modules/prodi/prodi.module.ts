import { Module } from '@nestjs/common';
import { ProdiController } from './prodi.controller';
import { ProdiService } from './prodi.service';

@Module({
  imports: [ProdiModule],
  controllers: [ProdiController],
  providers: [ProdiService]
})
export class ProdiModule {}
