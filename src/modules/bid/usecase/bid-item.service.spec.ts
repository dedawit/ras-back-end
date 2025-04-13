import { Test, TestingModule } from '@nestjs/testing';
import { BidItemService } from './bid-item.service';

describe('BidItemService', () => {
  let service: BidItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BidItemService],
    }).compile();

    service = module.get<BidItemService>(BidItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
