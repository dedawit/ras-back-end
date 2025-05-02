import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { UserRepository } from 'src/modules/user/persistence/user.repository'; // Adjust path if needed
import { v4 as uuidv4 } from 'uuid';
import { CreateProductDTO, UpdateProductDTO } from '../dto/product.dto';
import { Product } from '../../persistence/product.entity';
import { ProductRepository } from '../../persistence/product.repository';
import { UserService } from 'src/modules/user/usecase/user.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly userService: UserService,
  ) {}

  /**
   * Generates a unique product ID
   */
  private async generateUniqueProductId(): Promise<string> {
    let productId: string;
    while (true) {
      productId = uuidv4();
      const existingProduct = await this.productRepository
        .getProductById(productId)
        .catch(() => null);
      if (!existingProduct) {
        return productId;
      }
    }
  }

  /**
   * Creates a new product
   */
  async createProduct(
    userId: string,
    productDto: CreateProductDTO,
  ): Promise<Product> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const productId = await this.generateUniqueProductId();
    try {
      const product = await this.productRepository.createProduct(
        productDto,
        user,
        productId,
      );
      return product;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  /**
   * Retrieves a product by ID
   */
  async viewProduct(id: string): Promise<Product> {
    const product = await this.productRepository.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Updates an existing product
   */
  async editProduct(
    id: string,
    productDto: UpdateProductDTO,
  ): Promise<Product> {
    const existingProduct = await this.viewProduct(id);
    try {
      const updatedProduct = await this.productRepository.updateProduct(
        id,
        productDto,
      );
      return updatedProduct;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  /**
   * Deletes a product
   */
  async deleteProduct(id: string): Promise<Product> {
    return this.productRepository.deleteProduct(id);
  }

  /**
   * Retrieves all products for a user
   */
  async findAllProducts(userId: string): Promise<Product[]> {
    return this.productRepository.findAllProducts(userId);
  }

  /**
   * Retrieves all products (public)
   */
  async findAllProductsPublic(): Promise<Product[]> {
    return this.productRepository.findAllProductsPublic();
  }
}
