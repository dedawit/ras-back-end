import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { RFQService } from '../usecase/rfq.service';
import { createRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { RFQ } from '../persistence/rfq.entity';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import { RFQResponse } from '../usecase/dto/rfq-response.dto';

@Controller('rfq')
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @SerializeResponse(RFQResponse)
  @Post('buyer/:buyerId/create-rfq')
  async createRFQ(
    @Param('buyerId') buyerId: string,
    @Body() rfqDto: createRFQDTO,
  ): Promise<RFQ> {
    return this.rfqService.createRFQ(buyerId, rfqDto);
  }

  @SerializeResponse(RFQResponse)
  @Get(':id/view-rfq')
  async viewRFQ(@Param('id') id: string): Promise<RFQ> {
    return this.rfqService.viewRFQ(id);
  }

  @SerializeResponse(RFQResponse)
  @Put(':rfqId/buyer/:buyerId/edit-rfq')
  async editRFQ(
    @Param('rfqId') rfqId: string,
    @Param('buyerId') buyerId: string,
    @Body() rfqDto: UpdateRFQDTO,
  ): Promise<RFQ> {
    return this.rfqService.editRFQ(rfqId, buyerId, rfqDto);
  }

  @SerializeResponse(RFQResponse)
  @Put(':productId/open/buyer/:buyerId/open-rfq')
  async openRFQ(
    @Param('productId') productId: string,
    @Param('buyerId') buyerId: string,
  ): Promise<RFQ> {
    return this.rfqService.openRFQ(productId, buyerId);
  }

  @SerializeResponse(RFQResponse)
  @Put(':rfqId/close/buyer/:buyerId/close-rfq')
  async closeRFQ(
    @Param('rfqId') rfqId: string,
    @Param('buyerId') buyerId: string,
  ): Promise<RFQ> {
    return this.rfqService.closeRFQ(rfqId, buyerId);
  }
}
