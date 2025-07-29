import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Req, ParseIntPipe, Query } from '@nestjs/common';
import { PelaksanaanPendidikanService } from './pelaksanaan-pendidikan.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { TypeUserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('pelaksanaan-pendidikan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PelaksanaanPendidikanController {
  constructor(private readonly pelaksanaanPendidikanService: PelaksanaanPendidikanService) { }

  @Post()
  @Roles(TypeUserRole.DOSEN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,

    @Body() body: any,
    @Req() req: any
  ) {
    const dosenId = req.user.sub;
    const kategori = body.kategori;

    return this.pelaksanaanPendidikanService.create(dosenId, body, file);
  }


  @Get()
  @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findAll(
    @Query() query: any,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.role;

    return this.pelaksanaanPendidikanService.findAll(query, dosenId, role);
  }


  @Get(':id')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR, TypeUserRole.DOSEN)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.role;

    return this.pelaksanaanPendidikanService.findOne(id, dosenId, role);
  }


  @Patch(':id')
  @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,

    @Body() body: any,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.role;

    return this.pelaksanaanPendidikanService.update(id, dosenId, body, file, role);
  }

  @Delete(':id')
  @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.role;

    return this.pelaksanaanPendidikanService.delete(id, dosenId, role);
  }
}
