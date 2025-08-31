import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [SyncModule, HttpModule],
    controllers: [SyncController],
    providers: [SyncService],
})
export class SyncModule {}
