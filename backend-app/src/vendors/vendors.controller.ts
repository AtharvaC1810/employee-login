import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  // GET all vendors
  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  // GET vendor by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(Number(id));
  }

  // CREATE vendor
  @Post()
  create(@Body() dto: CreateVendorDto) {
    return this.vendorsService.create(dto);
  }

  // UPDATE vendor (PATCH) → Used by your frontend
  @Patch(':id')
  patchUpdate(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.update(Number(id), dto);
  }

  // UPDATE vendor (PUT) → Optional
  @Put(':id')
  putUpdate(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.update(Number(id), dto);
  }

  // DELETE vendor
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(Number(id));
  }
}
