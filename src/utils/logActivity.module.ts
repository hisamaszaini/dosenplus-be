import { Module } from '@nestjs/common';
import { LogActivityService } from './logActivity';

@Module({
  providers: [LogActivityService],
  exports: [LogActivityService],
})
export class LogActivityModule {}
