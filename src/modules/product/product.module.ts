import { Module } from '@nestjs/common';
import { ProductService } from './usecase/product/product.service';
import { ProductController } from './controller/product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './persistence/product.entity';
import { UserModule } from '../user/user.module';
import { ProductRepository } from './persistence/product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), UserModule],
  providers: [ProductService, ProductRepository],
  controllers: [ProductController],
})
export class ProductModule {}
