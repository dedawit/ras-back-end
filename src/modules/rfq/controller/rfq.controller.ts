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
  @Post('create')
  async createRFQ(@Body() rfqDto: createRFQDTO): Promise<RFQ> {
    return this.rfqService.createRFQ(rfqDto);
  }

  @SerializeResponse(RFQResponse)
  @Get(':id/singleRFQ')
  async viewRFQ(@Param('id') id: number): Promise<RFQ> {
    return this.rfqService.viewRFQ(id);
  }

  @SerializeResponse(RFQResponse)
  @Put('edit/:id/edditRFQ')
  async editRFQ(@Param('id') id: number, @Body() rfqDto: UpdateRFQDTO): Promise<RFQ> {
    return this.rfqService.editRFQ(id, rfqDto);
  }

  @SerializeResponse(RFQResponse)
  @Put('open/:id/OpenRFQ')
  async openRFQ(@Param('id') id: number): Promise<RFQ> {
    return this.rfqService.openRFQ(id);
  }

  @SerializeResponse(RFQResponse)
  @Put('close/:id/CloseRFQ')
  async closeRFQ(@Param('id') id: number): Promise<RFQ> {
    return this.rfqService.closeRFQ(id);
  }
}
