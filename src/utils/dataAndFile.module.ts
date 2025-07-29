import { Global, Module } from '@nestjs/common';
import { DataAndFileService } from './dataAndFile';

@Global()
@Module({
  providers: [DataAndFileService],
  exports: [DataAndFileService],
})
export class DataAndFileModule {}
