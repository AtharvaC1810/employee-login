import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permService: PermissionsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return await this.permService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return await this.permService.findOne(+id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: { name: string; description?: string }) {
    return await this.permService.create(body.name, body.description);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: { name: string; description?: string },
  ) {
    return await this.permService.update(+id, body.name, body.description);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.permService.remove(+id);
  }
}
