import { Module, forwardRef } from '@nestjs/common';
import { BidController } from './controller/bid.controller';
import { BidService } from './usecase/bid.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './persistence/bid.entity';
import { BidItem } from './persistence/bit-item.entity';
import { UserModule } from '../user/user.module';
import { RFQModule } from '../rfq/rfq.module';
import { BidItemService } from './usecase/bid-item.service';
import { BidRepository } from './persistence/bid.repository';
import { BidItemRepository } from './persistence/bid-item.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, BidItem]),
    UserModule,
    forwardRef(() => RFQModule),
  ],
  providers: [BidService, BidItemService, BidRepository, BidItemRepository],
  controllers: [BidController],
  exports: [BidService, BidRepository, BidItemService, BidItemRepository],
})
export class BidModule {}
