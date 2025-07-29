import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HashAndEncryptModule } from 'src/utils/hashAndEncrypt.module';

@Module({
  imports: [HashAndEncryptModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  
})
export class UsersModule {}
