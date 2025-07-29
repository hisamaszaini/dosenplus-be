import { Module } from '@nestjs/common';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';

@Module({
  imports: [
    SemesterModule
  ],
  controllers: [SemesterController],
  providers: [SemesterService]
})
export class SemesterModule { }
