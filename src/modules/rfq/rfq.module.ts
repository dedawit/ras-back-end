import { Module } from '@nestjs/common';
import { RFQController } from './controller/rfq.controller';
import { RFQService } from './usecase/rfq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RFQ } from './persistence/rfq.entity';
import { RFQRepository } from './persistence/rfq.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RFQ])],
  controllers: [RFQController],
  providers: [RFQService, RFQRepository],
})
export class RFQModule {}
