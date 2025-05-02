import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { RoleGuard } from 'src/modules/common/guards/role.guard';
import { Roles } from 'src/modules/common/roles.decorator';
import { ProductService } from '../usecase/product/product.service';
import { Product } from '../persistence/product.entity';
import { CreateProductDTO, UpdateProductDTO } from '../usecase/dto/product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Creates a new product
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin') // Adjust role as needed
  @Post(':userId/create')
  @SerializeResponse(Product)
  async createProduct(
    @Param('userId') userId: string,
    @Body() productDto: CreateProductDTO,
  ): Promise<Product> {
    return this.productService.createProduct(userId, productDto);
  }

  /**
   * Retrieves a product by ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/view')
  @SerializeResponse(Product)
  async viewProduct(@Param('id') id: string): Promise<Product> {
    return this.productService.viewProduct(id);
  }

  /**
   * Updates an existing product
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin') // Adjust role as needed
  @Patch(':id/edit')
  @SerializeResponse(Product)
  async editProduct(
    @Param('id') id: string,
    @Body() productDto: UpdateProductDTO,
  ): Promise<Product> {
    return this.productService.editProduct(id, productDto);
  }

  /**
   * Deletes a product
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin') // Adjust role as needed
  @Delete(':id/delete')
  @SerializeResponse(Product)
  async deleteProduct(@Param('id') id: string): Promise<Product> {
    return this.productService.deleteProduct(id);
  }

  /**
   * Retrieves all products for a user
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin') // Adjust role as needed
  @Get(':userId/view-all')
  @SerializeResponse(Product)
  async findAllProducts(@Param('userId') userId: string): Promise<Product[]> {
    return this.productService.findAllProducts(userId);
  }

  /**
   * Retrieves all products (public)
   */
  @Get('view-all-public')
  @SerializeResponse(Product)
  async findAllProductsPublic(): Promise<Product[]> {
    return this.productService.findAllProductsPublic();
  }
}
