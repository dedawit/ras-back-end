import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { RoleGuard } from 'src/modules/common/guards/role.guard';
import { Roles } from 'src/modules/common/roles.decorator';
import { ProductService } from '../usecase/product/product.service';
import { Product } from '../persistence/product.entity';
import { CreateProductDTO, UpdateProductDTO } from '../usecase/dto/product.dto';
import { join } from 'path';
import * as fs from 'fs/promises';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Creates a new product with an image file
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Post(':userId/create')
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @Param('userId') userId: string,
    @Body() productDto: CreateProductDTO,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Product> {
    return this.productService.createProduct(userId, productDto, image);
  }

  /**
   * Retrieves a product by ID, returns image URI
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Get(':id/view')
  async viewProduct(
    @Param('id') id: string,
  ): Promise<Product & { imageUri?: string }> {
    const product = await this.productService.viewProduct(id);
    return {
      ...product,
      imageUri: product.image
        ? `${process.env.UNIQUE_URL}/secured-storage/product/${product.id}/${product.image}`
        : undefined,
    };
  }

  /**
   * Updates an existing product with optional image replacement
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Patch(':id/edit')
  @UseInterceptors(FileInterceptor('image'))
  async editProduct(
    @Param('id') id: string,
    @Body() productDto: UpdateProductDTO,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<Product> {
    return this.productService.editProduct(id, productDto, image);
  }

  /**
   * Deletes a product
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Delete(':id/delete')
  async deleteProduct(@Param('id') id: string): Promise<Product> {
    return this.productService.deleteProduct(id);
  }

  /**
   * Retrieves all products for a user, returns image URIs
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Get(':userId/view-all')
  async findAllProducts(
    @Param('userId') userId: string,
  ): Promise<(Product & { imageUri?: string })[]> {
    const products = await this.productService.findAllProducts(userId);

    return products.map((product) => ({
      ...product,
      imageUri: product.image
        ? `${process.env.UNIQUE_URL}/secured-storage/product/${product.id}/${product.image}`
        : undefined,
    }));
  }

  /**
   * Retrieves all products (public), returns image URIs
   */
  @Get('view-all-public')
  async findAllProductsPublic(): Promise<(Product & { imageUri?: string })[]> {
    const products = await this.productService.findAllProductsPublic();
    return products.map((product) => ({
      ...product,
      imageUri: product.image
        ? `/product/${product.id}/${product.image}`
        : undefined,
    }));
  }

  /**
   * Serves a product image for display in <img> tag
   */
  @Get('image/:productId/:filename')
  async getImage(
    @Param('productId') productId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.productService.getImage(productId, filename, res);
  }

  //test
  @Get('test-image')
  async testImage() {
    return {
      message: 'Test endpoint',
      physicalPath: join(
        process.cwd(),
        'src/secured-storage/product/4fa68692-d1ac-4791-bfb5-7f8c2e43f770/image-4f62fcbb.png',
      ),
      url: 'http://localhost:3000/secured-storage/product/4fa68692-d1ac-4791-bfb5-7f8c2e43f770/image-4f62fcbb.png',
      exists: await fs
        .access(
          join(
            process.cwd(),
            'src/secured-storage/product/4fa68692-d1ac-4791-bfb5-7f8c2e43f770/image-4f62fcbb.png',
          ),
        )
        .then(() => true)
        .catch(() => false),
    };
  }
}
