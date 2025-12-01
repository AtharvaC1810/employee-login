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
import { diskStorage } from "multer";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { extname } from "path";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // -------------------------------
  // POST /products  (Create Product)
  // -------------------------------
  @Post()
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads/products",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, uniqueSuffix + ext);
        },
      }),
    })
  )
  create(
    @Body() body: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.create({
      ...body,
      image: file ? file.filename : null,
    });
  }

  // -------------------------------
  // GET /products (List all)
  // -------------------------------
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // -------------------------------
  // GET /products/:id (Single item)
  // -------------------------------
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(+id);
  }

  // -------------------------------
  // PATCH /products/:id (Update)
  // -------------------------------
  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads/products",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, uniqueSuffix + ext);
        },
      }),
    })
  )
  update(
    @Param("id") id: string,
    @Body() body: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.update(+id, {
      ...body,
      image: file ? file.filename : undefined, // don't overwrite if no new file
    });
  }

  // -------------------------------
  // DELETE /products/:id (Delete)
  // -------------------------------
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(+id);
  }
}
