import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseEnumPipe,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TypeUserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { ChangePasswordDto, CreateFlexibleUserDto, CreatePendingUpdateDto, UpdateFlexibleUserDto, UpdatePendingStatusDto } from './dto/user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';

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
    @Body() updateFlexibleUserDto: UpdateFlexibleUserDto) {
    return this.usersService.updateFlexibleUser(req.user.sub, updateFlexibleUserDto);
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
    @Body('createUserDto') createUserRaw: string,
  ) {
    let createUserDto: CreateFlexibleUserDto;

    try {
      if (!createUserRaw || typeof createUserRaw !== 'string') {
        throw new BadRequestException('createUserDto harus berupa string JSON.');
      }
      createUserDto = JSON.parse(createUserRaw);
    } catch (err) {
      throw new BadRequestException('createUserDto tidak valid. Harus berupa JSON string yang benar.');
    }

    return this.usersService.create(createUserDto, file);
  }

  @Put('dosen/update-data')
  @Roles(TypeUserRole.DOSEN)
  updatePendingData(@Req() req: any, @Body() dto: CreatePendingUpdateDto) {
    const dosenId = req.user.sub;
    return this.usersService.submitPendingUpdate(dosenId, dto);
  }

  @Patch('dosen/pending/:type/:id')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  handlePendingValidation(
    @Request() req,
    @Param('type', new ParseEnumPipe(['biodata', 'kepegawaian'])) type: 'biodata' | 'kepegawaian',
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePendingStatusDto
  ) {
    const reviewerId = req.user.sub;
    return this.usersService.updatePendingStatus(type, id, reviewerId, dto);
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
    @Body('updateUserDto') updateUserRaw: string,
  ) {
    let updateUserDto: UpdateFlexibleUserDto;
    try {
      if (!updateUserRaw || typeof updateUserRaw !== 'string') {
        throw new BadRequestException('updateUserDto harus berupa string JSON.');
      }

      updateUserDto = JSON.parse(updateUserRaw);
    } catch (error) {
      throw new BadRequestException('updateUserDto tidak valid. Harus berupa JSON string yang benar.');
    }

    return this.usersService.updateFlexibleUser(userId, updateUserDto, file);
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

  @Get(':id')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  @UseGuards(RolesGuard)
  getProfileById(
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return this.usersService.findById(userId);
  }

  @Delete(':id')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // @Patch('profile')
  // @UsePipes(new ZodValidationPipe(UpdateFlexibleUserSchema))
  // @Roles(TypeUserRole.ADMIN, TypeUserRole.DOSEN, TypeUserRole.VALIDATOR)
  // updateMyProfile(@Request() req, @Body() dto: z.infer<typeof UpdateFlexibleUserSchema>) {
  //   return this.usersService.updateFlexibleProfile(req.user.sub, dto);
  // }

  // @Patch('profile/password')
  // changeMyPassword(@Request() req, @Body() dto: ChangePasswordDto) {
  //   return this.usersService.changePassword(req.user.sub, dto);
  // }

  // // =============================
  // // = Manajemen oleh ADMIN =
  // // =============================
  // @Post(':role')
  // @Roles(TypeUserRole.ADMIN)
  // @HttpCode(HttpStatus.CREATED)
  // createUser(
  //   @Param('role') role: string,
  //   @Body()
  //   dto: CreateAdminUserDto | CreateDosenUserDto | CreateValidatorUserDto
  // ) {
  //   if (role === 'admin') return this.usersService.createAdminUser(dto as CreateAdminUserDto);
  //   if (role === 'dosen') return this.usersService.createDosenWithUserAccount(dto as CreateDosenUserDto);
  //   if (role === 'validator') return this.usersService.createValidatorUser(dto as CreateValidatorUserDto);
  //   throw new BadRequestException('Role tidak valid');
  // }

  // @Get()
  // @Roles(TypeUserRole.ADMIN)
  // findAll(@Query(new ZodValidationPipe(FindAllUsersSchema)) query: FindAllUsersDto) {
  //   return this.usersService.findAll(query);
  // }

  // @Get('search')
  // @Roles(TypeUserRole.ADMIN)
  // searchUsers(@Query('q') q: string) {
  //   return this.usersService.searchUsers(q);
  // }

  // @Get(':id')
  // @Roles(TypeUserRole.ADMIN)
  // findById(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.findById(id);
  // }

  // @Patch(':id/profile/:role')
  // @Roles(TypeUserRole.ADMIN)
  // updateUserProfile(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Param('role') role: string,
  //   @Body()
  //   dto: UpdateAdminProfileDto | UpdateDosenProfileDto | UpdateValidatorProfileDto
  // ) {
  //   if (role === 'admin') return this.usersService.updateAdminProfile(id, dto as UpdateAdminProfileDto);
  //   if (role === 'dosen') return this.usersService.updateDosenProfile(id, dto as UpdateDosenProfileDto, true);
  //   if (role === 'validator') return this.usersService.updateValidatorProfile(id, dto as UpdateValidatorProfileDto, true);
  //   throw new BadRequestException('Role tidak valid');
  // }

  // @Patch(':id/status')
  // @Roles(TypeUserRole.ADMIN)
  // updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserStatusDto) {
  //   return this.usersService.updateUserStatus(id, dto);
  // }

  // @Delete(':id')
  // @Roles(TypeUserRole.ADMIN)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.remove(id);
  // }

  // @Get('maintenance/check-integrity')
  // @Roles(TypeUserRole.ADMIN)
  // checkDataIntegrity() {
  //   return this.usersService.fixMissingRelationalData();
  // }
}