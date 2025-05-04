import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response } from 'express';
import { UserService } from 'src/modules/user/usecase/user.service';
import { CreateProductDTO, UpdateProductDTO } from '../dto/product.dto';
import { Product } from '../../persistence/product.entity';
import { ProductRepository } from '../../persistence/product.repository';

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
   * Handles image file upload
   */
  private async handleImageUpload(
    file: Express.Multer.File,
    productId: string,
  ): Promise<string> {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Image file size must not exceed 5MB');
    }

    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const ext = extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      throw new BadRequestException(
        'Invalid image file type. Allowed types are: jpg, jpeg, png',
      );
    }

    const safeProductId = productId.replace(/[^a-zA-Z0-9-]/g, '');
    const storagePath = path.join(
      process.cwd(),
      'src/secured-storage/product',
      safeProductId,
    );

    try {
      await fs.mkdir(storagePath, { recursive: true });
      const uniqueSuffix = uuidv4().slice(0, 8);
      const fileName = `image-${uniqueSuffix}${ext}`;
      const filePath = path.join(storagePath, fileName);

      try {
        await fs.access(filePath);
        throw new InternalServerErrorException(
          `File ${fileName} already exists`,
        );
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }

      await fs.writeFile(filePath, file.buffer);
      return fileName;
    } catch (error) {
      try {
        await fs.rm(storagePath, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error(`Failed to clean up ${storagePath}:`, cleanupError);
      }
      throw new InternalServerErrorException('Failed to save image file');
    }
  }

  /**
   * Cleans up an image file
   */
  private async cleanupImage(
    fileName: string,
    productId: string,
  ): Promise<void> {
    try {
      const filePath = path.join(
        process.cwd(),
        'src/secured-storage/product',
        productId,
        fileName,
      );
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  /**
   * Creates a new product with an image
   */
  async createProduct(
    userId: string,
    productDto: CreateProductDTO,
    image: Express.Multer.File,
  ): Promise<Product> {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const productId = await this.generateUniqueProductId();
    const imageFileName = await this.handleImageUpload(image, productId);

    try {
      const product = await this.productRepository.createProduct(
        productDto,
        user,
        productId,
        imageFileName,
      );
      return product;
    } catch (error) {
      await this.cleanupImage(imageFileName, productId);
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
   * Updates an existing product with optional image replacement
   */
  async editProduct(
    id: string,
    productDto: UpdateProductDTO,
    image?: Express.Multer.File,
  ): Promise<Product> {
    const existingProduct = await this.viewProduct(id);
    let newImageFileName = existingProduct.image;

    if (image) {
      await this.cleanupImage(existingProduct.image, id);
      newImageFileName = await this.handleImageUpload(image, id);
    }

    try {
      const updatedProduct = await this.productRepository.updateProduct(
        id,
        productDto,
        newImageFileName,
      );
      return updatedProduct;
    } catch (error) {
      if (image && newImageFileName !== existingProduct.image) {
        await this.cleanupImage(newImageFileName, id);
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  /**
   * Deletes a product
   */
  async deleteProduct(id: string): Promise<Product> {
    const product = await this.viewProduct(id);
    if (product.image) {
      await this.cleanupImage(product.image, id);
    }
    return this.productRepository.deleteProduct(id);
  }

  /**
   * Retrieves all products for a user
   */
  async findAllProducts(userId: string): Promise<Product[]> {
    const prodcuts = await this.productRepository.findAllProducts(userId);
    return prodcuts;
  }

  /**
   * Retrieves all products (public)
   */
  async findAllProductsPublic(): Promise<Product[]> {
    return this.productRepository.findAllProductsPublic();
  }

  /**
   * Serves a product image for display in <img> tag
   */
  async getImage(
    productId: string,
    filename: string,
    res: Response,
  ): Promise<void> {
    const safeProductId = productId.replace(/[^a-zA-Z0-9-]/g, '');
    if (!safeProductId) {
      throw new BadRequestException('Invalid productId provided');
    }

    const filePath = path.join(
      process.cwd(),
      'src/secured-storage/product',
      safeProductId,
      filename,
    );

    try {
      await fs.access(filePath);
      res.setHeader('Content-Type', 'image/*');
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).end();
        }
      });
    } catch (error) {
      throw new BadRequestException('Image not found or inaccessible');
    }
  }
}
