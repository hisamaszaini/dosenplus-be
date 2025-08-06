import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { ProdiService } from './prodi.service';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CreateProdiDto, UpdateProdiDto } from './dto/prodi.dto';
import { TypeUserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prodi')
export class ProdiController {
    constructor(private readonly prodiService: ProdiService) {
    }

    @Post()
    @Roles(TypeUserRole.ADMIN)
    create(@Body() createProdiDto: CreateProdiDto) {
        return this.prodiService.create(createProdiDto);
    }

    @Get()
    @Roles(TypeUserRole.ADMIN, TypeUserRole.DOSEN, TypeUserRole.VALIDATOR)
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('fakultasId') fakultasId?: number,
        @Query('sortBy') sortBy = 'createdAt',
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        return this.prodiService.findAll({ page, limit, search, fakultasId, sortBy, sortOrder });
    }

    @Get(':id')
    @Roles(TypeUserRole.ADMIN, TypeUserRole.DOSEN, TypeUserRole.VALIDATOR)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.prodiService.findOne(id);
    }


    @Patch(':id')
    @Roles(TypeUserRole.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProdiDto: UpdateProdiDto) {
        return this.prodiService.update(id, updateProdiDto);
    }

    @Delete(':id')
    @Roles(TypeUserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.prodiService.remove(id);
    }
}
