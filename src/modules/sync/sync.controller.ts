/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SyncService } from './sync.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { TypeUserRole } from '@prisma/client';

@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) { }

  @Get('fakultas')
  @Roles(TypeUserRole.ADMIN)
  syncFakultas() {
    return this.syncService.syncFakultas();
  }


  @Get('prodi')
  @Roles(TypeUserRole.ADMIN)
  syncProdi() {
    return this.syncService.syncProdi();
  }

}
