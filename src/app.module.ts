import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { FakultasModule } from './modules/fakultas/fakultas.module';
import { SemesterModule } from './modules/semester/semester.module';
import { ProdiModule } from './modules/prodi/prodi.module';
import { PendidikanModule } from './modules/pendidikan/pendidikan.module';
import { PelaksanaanPendidikanModule } from './modules/pelaksanaan-pendidikan/pelaksanaan-pendidikan.module';
import { PrismaModule } from '../prisma/prisma.module';

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

  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
  exports: [],
})
export class AppModule { }
