import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, HttpCode, HttpStatus, MaxFileSizeValidator, Param, ParseEnumPipe, ParseFilePipe, ParseIntPipe, Patch, Post, Put, Query, Req, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { StatusValidasi, TypeUserRole, UserStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto, CreateFlexibleUserDto, CreatePendingUpdateDto, UpdateFlexibleUserDto, ValidatePendingUpdateDto } from '@/modules/users/dto/user.dto';
import { UsersService } from '@/modules/users/users.service';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }

  @Patch('profile')
  updateProfile(@Request() req,
    @Body() data: any) {
    return this.usersService.updateSelfProfile(req.user.sub, data);
  }

  @Patch('profile/password')
  async changeMyPassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.sub, dto);
  }

  @Patch('profile/foto')
  @UseInterceptors(FileInterceptor('file'))
  async dosenUpdatePhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(image\/jpeg|image\/jpg|image\/png)/ }),
        ],
      })
    )
    file: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.usersService.updatePhoto(userId, file);
  }

  @Patch('dosen/update-data/:dosenId/validasi')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  handlePendingValidation(
    @Param('dosenId', ParseIntPipe) dosenId: number,
    @Body() data: any,
    @Request() req,
  ) {
    const reviewerId = req.user.sub;
    return this.usersService.validatePendingUpdate(dosenId, reviewerId, data);
  }

  @Post()
  @Roles(TypeUserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /(image\/jpeg|image\/jpg|image\/png)/ }),
        ],
      })
    )
    file: Express.Multer.File,

    @Body('data') dataRaw: string,
  ) {
    let data: CreateFlexibleUserDto;

    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }

      data = JSON.parse(dataRaw);
    } catch (err) {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string yang benar.');
    }

    return this.usersService.create(data, file);
  }

  @Put('dosen/update-data')
  @Roles(TypeUserRole.DOSEN)
  updatePendingData(@Req() req: any, @Body() dto: CreatePendingUpdateDto) {
    const dosenId = req.user.sub;
    return this.usersService.submitPendingUpdate(dosenId, dto);
  }

  @Get('update-data')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  async findAllPendingUpdate(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: StatusValidasi | '',
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.usersService.findAllPendingUpdate({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      status,
      sortBy,
      sortOrder,
    });
  }

  @Get('dosen/update-data')
  @Roles(TypeUserRole.DOSEN)
  getPendingUpdate(@Req() req: any) {
    const dosenId = req.user.sub;
    return this.usersService.getPendingUpdateById(dosenId);
  }

  @Get('dosen/update-data/:dosenId')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  getPendingUpdateById(
    @Param('dosenId', ParseIntPipe) dosenId: number
  ) {
    console.log(`getPendingUpdateById: ${dosenId}`);
    return this.usersService.getPendingUpdateById(dosenId);
  }

  @Get(':id')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  @UseGuards(RolesGuard)
  getProfileById(
    @Param('id', ParseIntPipe) userId: number
  ) {
    return this.usersService.findById(userId);
  }

  @Get()
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: TypeUserRole,
    @Query('status') status?: UserStatus,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    return this.usersService.findAll({ page, limit, search, role, status, sortBy, sortOrder });
  }

  @Patch(':id')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateFlexibleUser(
    @Param('id', ParseIntPipe) userId: number,

    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // Maks 2MB
          new FileTypeValidator({ fileType: /(image\/jpeg|image\/jpg|image\/png)/ }),
        ],
      })
    )
    file: Express.Multer.File,

    @Body('data') dataRaw: string,
  ) {
    let data: UpdateFlexibleUserDto;

    try {
      if (!dataRaw || typeof dataRaw !== 'string') {
        throw new BadRequestException('data harus berupa string JSON.');
      }

      data = JSON.parse(dataRaw);
    } catch (error) {
      throw new BadRequestException('data tidak valid. Harus berupa JSON string yang benar.');
    }

    return this.usersService.updateFlexibleUser(userId, data, file);
  }

  @Get('dosen')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  findAllDosen(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('jabatan') jabatan?: string,
    @Query('fakultasId') fakultasId?: number,
    @Query('prodiId') prodiId?: number,
    @Query('sortBy') sortBy = 'nama',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    return this.usersService.findAllDosen({ page, limit, search, jabatan, fakultasId, prodiId, sortBy, sortOrder, });
  }

  @Get('validator')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  findAllValidator(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy = 'nama',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    return this.usersService.findAllValidator({ page, limit, search, sortBy, sortOrder });
  }

  @Delete('/update-data/:dosenId')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  async removePendingUpdate(@Param('dosenId', ParseIntPipe) dosenId: number) {
    return this.usersService.removePendingUpdate(dosenId);
  }

  @Delete(':id')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

}