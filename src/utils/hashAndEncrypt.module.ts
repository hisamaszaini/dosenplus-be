import { Module } from '@nestjs/common';
import { HashAndEncryptService } from './hashAndEncrypt';

@Module({
  providers: [HashAndEncryptService],
  exports: [HashAndEncryptService],
})
export class HashAndEncryptModule {}
