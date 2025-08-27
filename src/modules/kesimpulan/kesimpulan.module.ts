import { Module } from '@nestjs/common';
import { KesimpulanController } from './kesimpulan.controller';
import { KesimpulanService } from './kesimpulan.service';

@Module({
    imports: [
        KesimpulanModule
    ],
    controllers: [KesimpulanController],
    providers: [KesimpulanService],
})
export class KesimpulanModule { }
