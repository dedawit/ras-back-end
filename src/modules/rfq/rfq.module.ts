import { forwardRef, Module } from '@nestjs/common';
import { RFQController } from './controller/rfq.controller';
import { RFQService } from './usecase/rfq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RFQ } from './persistence/rfq.entity';
import { RFQRepository } from './persistence/rfq.repository';
import { UserModule } from '../user/user.module';
import { BidModule } from '../bid/bid.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RFQ]),
    UserModule,
    forwardRef(() => BidModule),
  ],
  controllers: [RFQController],
  providers: [RFQService, RFQRepository],
  exports: [RFQService, RFQRepository],
})
export class RFQModule {}
