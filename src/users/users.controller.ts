import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TypeUserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { ChangePasswordDto, CreateFlexibleUserDto, UpdateFlexibleUserDto } from './dto/user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

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

  @Post()
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() createUserDto: CreateFlexibleUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  findAll(@Request() req, @Query() query: any) {
    return this.usersService.findAll(query, req.user);
  }

  @Patch(':id')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateFlexibleUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateFlexibleUserDto) {
    return this.usersService.updateFlexibleUser(userId, updateUserDto);
  }

  @Get(':id')
  @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
  @UseGuards(RolesGuard)
  getProfileById(
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return this.usersService.findById(userId);
  }

  @Get('dosen')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  findAllDosen(@Query() query: any) {
    return this.usersService.findAllDosen(query);
  }

  @Get('validator')
  @Roles(TypeUserRole.ADMIN)
  @UseGuards(RolesGuard)
  findAllValidator(@Query() query: any) {
    return this.usersService.findAllValidator(query);
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