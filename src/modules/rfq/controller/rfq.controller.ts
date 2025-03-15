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
  Res,
  Patch,
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
import { Response } from 'express';

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
  @SerializeResponse(RFQResponse)
  @UseGuards(JwtAuthGuard)
  async findAllRFQs(@Param('buyerId') buyerId: string): Promise<RFQ[]> {
    return this.rfqService.findAllRFQs(buyerId);
  }

  //get all rfqs for sellers
  @Get(':sellerId/seller/view-all-rfqs')
  @Roles('seller')
  @SerializeResponse(RFQResponse)
  @UseGuards(JwtAuthGuard)
  async findAllRFQsSeller(@Param('sellerId') sellerId: string): Promise<RFQ[]> {
    return this.rfqService.findAllRFQsSeller(sellerId);
  }

  @SerializeResponse(RFQResponse)
  @Get(':id/view-rfq')
  async viewRFQ(@Param('id') id: string): Promise<RFQ> {
    return this.rfqService.viewRFQ(id);
  }

  @UseInterceptors(RequestLoggingInterceptor)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':rfqId/edit-rfq')
  async editRFQ(
    @Param('rfqId') rfqId: string,
    @Body() rfqDto: UpdateRFQDTO,
    @UploadedFile() file?: Multer.File,
  ): Promise<RFQ> {
    return this.rfqService.editRFQ(rfqId, rfqDto, file);
  }

  @SerializeResponse(RFQResponse)
  @Patch(':rfqId/open-rfq')
  async openRFQ(
    @Param('rfqId') rfqId: string,
    @Param('buyerId') buyerId: string,
  ): Promise<RFQ> {
    return this.rfqService.openRFQ(rfqId);
  }

  @SerializeResponse(RFQResponse)
  @Patch(':rfqId/close-rfq')
  async closeRFQ(
    @Param('rfqId') rfqId: string,
    @Param('buyerId') buyerId: string,
  ): Promise<RFQ> {
    return this.rfqService.closeRFQ(rfqId);
  }

  //download RFQ
  @Get(':rfqId/:filename')
  async downloadFile(
    @Param('rfqId') rfqId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.rfqService.downloadFile(rfqId, filename, res);
  }
}
