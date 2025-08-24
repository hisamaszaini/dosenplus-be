import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Req, BadRequestException, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PenelitianService } from './penelitian.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { TypeUserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePenelitianFullDto } from './dto/update-penelitian.dto';
import { ParseJsonStringPipe } from '@/common/pipes/parse-json-string.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePenelitianFullDto } from './dto/create-penelitian.dto';

@Controller('penelitian')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenelitianController {
  constructor(private readonly penelitianService: PenelitianService) { }

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
    let data: CreatePenelitianFullDto;
    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }
      data = JSON.parse(dataRaw);
    } catch {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string.');
    }
    const dosenId = req.user.sub;
    return this.penelitianService.create(dosenId, data, file);
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

    @Body('data') dataRaw: CreatePenelitianFullDto,
    @Req() req: any
  ) {
    let data: CreatePenelitianFullDto;
    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }
      data = JSON.parse(dataRaw);
    } catch {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string.');
    }
    console.log(dosenId);
    return this.penelitianService.create(dosenId, data, file);
  }

  @Get()
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findAll(
    @Query() query: any,
  ) {
    return this.penelitianService.findAll(query);
  }

  @Get('dosen')
  @Roles(TypeUserRole.DOSEN)
  async findAllForDosen(
    @Query() query: any,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;

    return this.penelitianService.findAll(query, dosenId);
  }

  @Get('dosen/:dosenId')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findByDosen(
    @Param('dosenId', ParseIntPipe) dosenId: number,
    @Query() query: any,
  ) {
    return this.penelitianService.findAll(query, dosenId);
  }

  @Get(':id')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR, TypeUserRole.DOSEN)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.roles;

    return this.penelitianService.findOne(id, dosenId, role);
  }

  @Patch(':id/validasi')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async validatePendidikan(
    @Param('id', ParseIntPipe) id: number,
    @Body() rawData: any,
    @Req() req,
  ) {
    const reviewerId = req.user.sub;
    return this.penelitianService.validate(id, rawData, reviewerId);
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
    return this.penelitianService.update(id, dosenId, data, role, file);
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

    @Body('data', new ParseJsonStringPipe) data: UpdatePenelitianFullDto,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.roles;
    return this.penelitianService.update(id, dosenId, data, role, file);
  }


  @Delete(':id')
  @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const dosenId = req.user.sub;
    const role = req.user.roles;

    return this.penelitianService.delete(id, dosenId, role);
  }
}
