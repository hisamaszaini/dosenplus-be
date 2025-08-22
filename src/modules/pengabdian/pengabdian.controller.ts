import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Req, BadRequestException, ParseIntPipe, Query } from '@nestjs/common';
import { PengabdianService } from './pengabdian.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TypeUserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePengabdianFullDto } from './dto/create-pengabdian.dto';
import { ParseJsonStringPipe } from '@/common/pipes/parse-json-string.pipe';
import { UpdatePengabdianFullDto } from './dto/update-pengabdian.dto';

@Controller('pengabdian')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PengabdianController {
  constructor(private readonly pengabdianService: PengabdianService) { }

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

    @Body('data') dataRaw: any,
    @Req() req: any
  ) {
    let data: CreatePengabdianFullDto;
    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }
      data = JSON.parse(dataRaw);
    } catch {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string.');
    }
    const dosenId = req.user.sub;
    return this.pengabdianService.create(dosenId, data, file);
  }

  @Post('admin/:dosenId')
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async createByAdmin(
    @Param('dosenId', ParseIntPipe) dosenId: number,

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,

    @Body('data') dataRaw: CreatePengabdianFullDto,
    @Req() req: any
  ) {
    let data: CreatePengabdianFullDto;
    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }
      data = JSON.parse(dataRaw);
    } catch {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string.');
    }
    console.log(dosenId);
    return this.pengabdianService.create(dosenId, data, file);
  }

  @Get()
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findAll(
    @Query() query: any,
  ) {
    return this.pengabdianService.findAll(query);
  }

  @Get('dosen')
  @Roles(TypeUserRole.DOSEN)
  async findAllForDosen(
    @Query() query: any,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;

    return this.pengabdianService.findAll(query, dosenId);
  }

  @Get('dosen/:dosenId')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findByDosen(
    @Param('dosenId', ParseIntPipe) dosenId: number,
    @Query() query: any,
  ) {
    return this.pengabdianService.findAll(query, dosenId);
  }

  @Get(':id')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR, TypeUserRole.DOSEN)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.roles;

    return this.pengabdianService.findOne(id, dosenId, role);
  }

  @Patch(':id/validasi')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async validatePendidikan(
    @Param('id', ParseIntPipe) id: number,
    @Body() rawData: any,
    @Req() req,
  ) {
    const reviewerId = req.user.sub;
    return this.pengabdianService.validate(id, rawData, reviewerId);
  }

  @Patch('admin/:dosenId/:id')
  @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async updateByAdmin(
    @Param('dosenId', ParseIntPipe) dosenId: number,
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

    @Body('data', new ParseJsonStringPipe) data: any,

    @Req() req: any,
  ) {
    const role = req.user.roles;
    return this.pengabdianService.update(id, dosenId, data, role, file);
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

    @Body('data', new ParseJsonStringPipe) data: UpdatePengabdianFullDto,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.roles;
    return this.pengabdianService.update(id, dosenId, data, role, file);
  }


  @Delete(':id')
  @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.roles;

    return this.pengabdianService.delete(id, dosenId, role);
  }
}
