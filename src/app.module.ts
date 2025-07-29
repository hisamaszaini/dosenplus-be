import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { FakultasModule } from './fakultas/fakultas.module';
import { SemesterModule } from './semester/semester.module';
import { ProdiModule } from './prodi/prodi.module';
import { PendidikanModule } from './pendidikan/pendidikan.module';
import { PelaksanaanPendidikanModule } from './pelaksanaan-pendidikan/pelaksanaan-pendidikan.module';
import { HashAndEncryptService } from './utils/hashAndEncrypt';
import { DataAndFileModule } from './utils/dataAndFile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    AuthModule,
    UsersModule,

    PrismaModule,

    MailModule,

    FakultasModule,

    SemesterModule,

    ProdiModule,

    PendidikanModule,

    PelaksanaanPendidikanModule,

    DataAndFileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, HashAndEncryptService],
  exports: [HashAndEncryptService],
})
export class AppModule { }
