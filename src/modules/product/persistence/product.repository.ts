import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

import { User } from 'src/modules/user/persistence/user.entity'; // Adjust path if needed
import { CreateProductDTO, UpdateProductDTO } from '../usecase/dto/product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Creates a new product
   */
  async createProduct(
    productDto: CreateProductDTO,
    createdBy: User,
    productId?: string,
  ): Promise<Product> {
    const product = this.productRepository.create({
      id: productId,
      ...productDto,
      createdBy,
      createdAt: new Date(),
    });

    return this.productRepository.save(product);
  }

  /**
   * Retrieves a product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  /**
   * Updates an existing product
   */
  async updateProduct(
    id: string,
    productDto: UpdateProductDTO,
  ): Promise<Product> {
    const existingProduct = await this.getProductById(id);
    this.productRepository.merge(existingProduct, productDto);
    return this.productRepository.save(existingProduct);
  }

  /**
   * Deletes a product (soft delete)
   */
  async deleteProduct(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    product.deletedAt = new Date();
    return this.productRepository.save(product);
  }

  /**
   * Finds all products for a user
   */
  async findAllProducts(createdById: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { createdBy: { id: createdById } },
      relations: ['createdBy'],
    });
  }

  /**
   * Finds all products (e.g., for public viewing)
   */
  async findAllProductsPublic(): Promise<Product[]> {
    return this.productRepository.find({
      where: { deletedAt: null },
      relations: ['createdBy'],
    });
  }
}
