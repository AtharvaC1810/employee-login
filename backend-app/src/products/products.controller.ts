import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from "multer";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  create(
    @UploadedFile() file: Multer.File,
    @Body() body: CreateProductDto,
  ) {
    return this.productsService.create(body, file);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("image"))
  update(
    @Param("id") id: string,
    @UploadedFile() file: Multer.File,
    @Body() body: CreateProductDto,
  ) {
    return this.productsService.update(+id, body, file);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(+id);
  }
}
