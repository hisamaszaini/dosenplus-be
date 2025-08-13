import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Request,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { PendidikanService } from './pendidikan.service';
import { CreatePendidikanDto } from './dto/create-pendidikan.dto';
import { UpdatePendidikanDto } from './dto/update-pendidikan.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { TypeUserRole } from '@prisma/client';

@Controller('pendidikan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PendidikanController {
  constructor(private readonly pendidikanService: PendidikanService) { }

  // Create hanya Dosen
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
    @Request() req,
    @Body('data') dataRaw: string,
  ) {

    console.log('FILE:', file);
    console.log('REQ:', req);

    const dosenId = req.user.sub;

    let data: CreatePendidikanDto;
    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }
      data = JSON.parse(dataRaw);
      console.log(file);
      console.log(data);
    } catch {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string.');
    }

    return this.pendidikanService.create(dosenId, data, file);
  }

  // Create untuk Admin
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

    @Body('data') dataRaw: string,
  ) {
    if (!dosenId) {
      throw new BadRequestException('ID Dosen wajib diisi.');
    }

    let data: CreatePendidikanDto;
    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }
      data = JSON.parse(dataRaw);
    } catch {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string.');
    }

    // console.log(file);
    // console.log(data);

    return this.pendidikanService.create(dosenId, data, file);
  }

  // Update
  @Patch(':id')
  @Roles(TypeUserRole.DOSEN)
  @HttpCode(HttpStatus.OK)
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
    file: Express.Multer.File | undefined,
    @Request() req,
    @Body('data') dataRaw: string,
  ) {
    const dosenId = req.user.sub;
    const roles = Array.isArray(req.user.roles) ? req.user.roles : req.user.roles ? [req.user.roles] : [];

    console.log('id: ', id);
    console.log('dosenId:', dosenId);

    let data: UpdatePendidikanDto;
    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }
      data = JSON.parse(dataRaw);
    } catch {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string.');
    }

    return this.pendidikanService.update(id, dosenId, data, roles, file);
  }

  //  Update untuk Admin
  @Patch('admin/:dosenId/:id')
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
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
    file: Express.Multer.File | undefined,

    @Body('data') dataRaw: string,
    @Request() req,
  ) {
    let data: UpdatePendidikanDto;
    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }
      data = JSON.parse(dataRaw);
    } catch {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string.');
    }
    const roles = req.user.roles
    return this.pendidikanService.update(id, dosenId, data, roles, file);
  }

  @Patch(':id/validasi')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async validatePendidikan(
    @Param('id', ParseIntPipe) id: number,
    @Body() rawData: any,
    @Request() req,
  ) {
    const reviewerId = req.user.sub;
    return this.pendidikanService.validate(id, rawData, reviewerId);
  }

  @Get()
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findAll(
    @Query() query: any,
  ) {
    return this.pendidikanService.findAll(query);
  }

  @Get('dosen')
  @Roles(TypeUserRole.DOSEN)
  async findAllForDosen(
    @Query() query: any,
    @Request() req,
  ) {
    return this.pendidikanService.findAll(query, req.user.sub);
  }

  @Get('dosen/:dosenId')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findByDosen(
    @Param('dosenId', ParseIntPipe) dosenId: number,
    @Query() query: any,
  ) {
    return this.pendidikanService.findAll(query, dosenId);
  }

  @Get('test')
  async test(
    @Request() req,
  ) {
    const roles = req.user.roles;

    const roleArray = typeof roles === 'string'
      ? [roles]
      : Array.isArray(roles)
        ? roles.map(r => typeof r === 'string' ? r : r.role?.name).filter(Boolean)
        : roles && typeof roles === 'object'
          ? Object.values(roles)
          : [];

    if(roleArray.includes('ADMIN')){
      console.log('Punya role admin')
    }
    
    console.log(roleArray);
  }

  @Get(':id')
  @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const item = await this.pendidikanService.findOne(id, req.user.sub, req.user.roles);
    return item;
  }

  @Delete(':id')
  @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN)
  async remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = req.user.sub;
    const roles = req.user.roles;
    return this.pendidikanService.delete(id, userId, roles);
  }

  // @Get(':id/file')
  // @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN)
  // async downloadFile(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Request() req,
  //   @Res({ passthrough: true }) res: Response,
  //   @Query('download') download?: string,
  // ) {
  //   const { sub: userId, role } = req.user;

  //   try {
  //     const { file, disposition } = await this.pendidikanService.streamFileById(
  //       id,
  //       userId,
  //       role,
  //       download === 'true',
  //     );

  //     res.setHeader('Content-Type', 'application/pdf');
  //     res.setHeader('Content-Disposition', disposition);
  //     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  //     res.setHeader('Pragma', 'no-cache');
  //     res.setHeader('Expires', '0');

  //     return file;
  //   } catch (error) {
  //     // Let the service handle the specific errors
  //     throw error;
  //   }
  // }

  // @Get(':id/preview')
  // @Roles(TypeUserRole.DOSEN, TypeUserRole.ADMIN)
  // async previewFile(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Request() req,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   const { sub: userId, role } = req.user;

  //   const { file, disposition } = await this.pendidikanService.streamFileById(
  //     id,
  //     userId,
  //     role,
  //     false, // Always inline for preview
  //   );

  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', disposition);
  //   res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour for preview

  //   return file;
  // }

  // Bulk operations for admin
  @Get('summary/stats')
  @Roles(TypeUserRole.ADMIN)
  async getStats(@Request() req) {
    return {
      message: 'Stats endpoint - implement in service if needed',
    };
  }

  @Post('bulk/delete')
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Request() req,
    @Body('ids') ids: number[],
  ) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('IDs harus berupa array yang tidak kosong');
    }

    if (ids.some(id => !Number.isInteger(id) || id <= 0)) {
      throw new BadRequestException('Semua ID harus berupa angka positif');
    }

    return {
      message: 'Bulk delete endpoint - implement in service if needed',
      ids,
    };
  }
}