import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user-role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from './user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Admin-only create (can create interns, engineers, admins)
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createByAdmin(dto);
  }

  // List users (Admins see all, others see only themselves)
  @Get()
  findAll(@Query('role') role: string | undefined, @CurrentUser() user: User) {
    if (user.role !== UserRole.ADMIN) {
      // Non-admins cannot see all users
      return [user];
    }
    return this.usersService.findAll(role as any);
  }

  // Get current user
  @Get('me')
  me(@CurrentUser() user: User) {
    const { password, ...rest } = user as any;
    return rest;
  }

  // Get user by ID
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.usersService.findOne(Number(id), user);
  }

  // Update user (Admins can update anyone, users can update self)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: User) {
    return this.usersService.update(Number(id), dto, user);
  }

  // Delete user (Admins only)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.usersService.remove(Number(id), user);
  }
}
