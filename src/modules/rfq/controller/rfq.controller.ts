import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { Multer } from 'multer';
import { RFQService } from '../usecase/rfq.service';
import { createRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { RFQ } from '../persistence/rfq.entity';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import { RFQResponse } from '../usecase/dto/rfq-response.dto';
import { RequestLoggingInterceptor } from 'src/modules/common/request-logging.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/modules/common/guards/role.guard';
import { Roles } from 'src/modules/common/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guard/auth.guard';

@Controller('rfq')
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @SerializeResponse(RFQResponse)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @UseInterceptors(RequestLoggingInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  @Post('buyer/:buyerId/create-rfq')
  async createRFQ(
    @Param('buyerId') buyerId: string,
    @Body() rfqDto: createRFQDTO,
    @UploadedFile() file?: Multer.File,
  ): Promise<RFQ> {
    return this.rfqService.createRFQ(buyerId, rfqDto, file);
  }

  //get all rfqs
  @Get(':buyerId/view-all-rfqs')
  @UseGuards(JwtAuthGuard)
  async findAllRFQs(@Param('buyerId') buyerId: string): Promise<RFQ[]> {
    return this.rfqService.findAllRFQs(buyerId);
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
  @Put(':rfqId/open/buyer/:buyerId/open-rfq')
  async openRFQ(
    @Param('rfqId') rfqId: string,
    @Param('buyerId') buyerId: string,
  ): Promise<RFQ> {
    return this.rfqService.openRFQ(rfqId, buyerId);
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
