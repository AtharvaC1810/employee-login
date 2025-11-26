import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private permService: PermissionsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.permService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.permService.findOne(+id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: { name: string; description?: string }) {
    return this.permService.create(body.name, body.description);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: { name: string; description?: string }) {
    return this.permService.update(+id, body.name, body.description);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.permService.remove(+id);
  }
}
