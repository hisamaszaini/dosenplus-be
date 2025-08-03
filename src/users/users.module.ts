import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HashAndEncryptModule } from 'src/utils/hashAndEncrypt.module';
import { LogActivityModule } from 'src/utils/logActivity.module';

@Module({
  imports: [HashAndEncryptModule, LogActivityModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  
})
export class UsersModule {}
