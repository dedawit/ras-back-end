import { Module } from '@nestjs/common';
import { RFQController } from './controller/rfq.controller';
import { RFQService } from './usecase/rfq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RFQ } from './persistence/rfq.entity';
import { RFQRepository } from './persistence/rfq.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([RFQ]), UserModule],
  controllers: [RFQController],
  providers: [RFQService, RFQRepository],
  exports: [RFQService],
})
export class RFQModule {}
