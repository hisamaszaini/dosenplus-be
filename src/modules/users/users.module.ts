import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LogActivityModule } from '@/utils/logActivity.module';

@Module({
  imports: [LogActivityModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  
})
export class UsersModule {}
