import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { SemesterService } from './semester.service';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { NamaSemester, TypeUserRole } from '@prisma/client';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('semester')
export class SemesterController {
    constructor(private readonly semesterService: SemesterService) { }

    @Post()
    @Roles(TypeUserRole.ADMIN)
    create(@Body() createSemesterDto: CreateSemesterDto) {
        return this.semesterService.create(createSemesterDto);
    }

    @Get()
    @Roles(TypeUserRole.ADMIN, TypeUserRole.DOSEN, TypeUserRole.VALIDATOR)
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('tahunMulai') tahunMulai?: number,
        @Query('tahunSelesai') tahunSelesai?: number,
        @Query('tipe') tipe?: NamaSemester,
        @Query('sortBy') sortBy = 'tahunMulai',
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        return this.semesterService.findAll({ page, limit, search, tahunMulai, tahunSelesai, sortBy, sortOrder });
    }

    @Get(':id')
    @Roles(TypeUserRole.ADMIN, TypeUserRole.DOSEN, TypeUserRole.VALIDATOR)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.semesterService.findOne(id);
    }

    @Patch(':id')
    @Roles(TypeUserRole.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSemesterDto: UpdateSemesterDto) {
        return this.semesterService.update(id, updateSemesterDto);
    }

    @Delete(':id')
    @Roles(TypeUserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.semesterService.remove(id);
    }
}