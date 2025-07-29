// src/fakultas/fakultas.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { FakultasService } from './fakultas.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { TypeUserRole } from '@prisma/client';
import { CreateFakultasDto, UpdateFakultasDto } from './dto/fakultas.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fakultas')
export class FakultasController {
  constructor(private readonly fakultasService: FakultasService) {}

  @Post()
  @Roles(TypeUserRole.ADMIN)
  create(@Body() createFakultasDto: CreateFakultasDto) {
    return this.fakultasService.create(createFakultasDto);
  }

  @Get()
  @Roles(TypeUserRole.ADMIN, TypeUserRole.DOSEN, TypeUserRole.VALIDATOR)
  findAll() {
    return this.fakultasService.findAll();
  }

  @Get(':id')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.DOSEN, TypeUserRole.VALIDATOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fakultasService.findOne(id);
  }

  @Patch(':id')
  @Roles(TypeUserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFakultasDto: UpdateFakultasDto) {
    return this.fakultasService.update(id, updateFakultasDto);
  }

  @Delete(':id')
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fakultasService.remove(id);
  }
}