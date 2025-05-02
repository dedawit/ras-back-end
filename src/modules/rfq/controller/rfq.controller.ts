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
  UploadedFiles,
  Delete,
} from '@nestjs/common';
import { RFQService } from '../usecase/rfq.service';
import { CreateRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { RFQ } from '../persistence/rfq.entity';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import { RFQResponse } from '../usecase/dto/rfq-response.dto';
import { RequestLoggingInterceptor } from 'src/modules/common/request-logging.interceptor';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/modules/common/guards/role.guard';
import { Roles } from 'src/modules/common/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { Response } from 'express';
import { Multer } from 'multer';

@Controller('rfq')
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  /**
   * Generate a new purchase number for a specific buyer
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @Get(':buyerId/generate-purchase-number')
  async generatePurchaseNumber(
    @Param('buyerId') buyerId: string,
  ): Promise<{ purchaseNumber: string }> {
    console.log(buyerId);
    const purchaseNumber =
      await this.rfqService.generatePurchaseNumber(buyerId);
    return { purchaseNumber };
  }

  @SerializeResponse(RFQResponse)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @UseInterceptors(RequestLoggingInterceptor)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'auctionDoc', maxCount: 1 },
      { name: 'guidelineDoc', maxCount: 1 },
    ]),
  )
  @Post('buyer/:buyerId/create-rfq')
  async createRFQ(
    @Param('buyerId') buyerId: string,
    @Body() rfqDto: CreateRFQDTO,
    @UploadedFiles()
    files: {
      auctionDoc: Express.Multer.File[];
      guidelineDoc: Express.Multer.File[];
    },
  ): Promise<RFQ> {
    return this.rfqService.createRFQ(buyerId, rfqDto, files);
  }

  //get all rfqs
  @Get(':buyerId/view-all-rfqs')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @SerializeResponse(RFQResponse)
  @UseGuards(JwtAuthGuard)
  async findAllRFQs(@Param('buyerId') buyerId: string): Promise<RFQ[]> {
    return this.rfqService.findAllRFQs(buyerId);
  }

  //get all rfqs for sellers
  @Get(':sellerId/seller/view-all-rfqs')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @SerializeResponse(RFQResponse)
  @UseGuards(JwtAuthGuard)
  async findAllRFQsSeller(@Param('sellerId') sellerId: string): Promise<RFQ[]> {
    return this.rfqService.findAllRFQsSeller(sellerId);
  }

  @SerializeResponse(RFQResponse)
  @UseGuards(JwtAuthGuard)
  @Get(':id/view-rfq')
  async viewRFQ(@Param('id') id: string): Promise<RFQ> {
    return this.rfqService.viewRFQ(id);
  }

  @UseInterceptors(RequestLoggingInterceptor)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'auctionDoc', maxCount: 1 },
      { name: 'guidelineDoc', maxCount: 1 },
    ]),
  )
  @Patch(':rfqId/edit-rfq')
  async editRFQ(
    @Param('rfqId') rfqId: string,
    @Body() rfqDto: UpdateRFQDTO,
    @UploadedFiles()
    files: {
      auctionDoc?: Express.Multer.File[];
      guidelineDoc?: Express.Multer.File[];
    },
  ): Promise<RFQ> {
    const auctionDocFile = files.auctionDoc?.[0]; // Optional chaining since files are optional
    const guidelineDocFile = files.guidelineDoc?.[0];
    return this.rfqService.editRFQ(
      rfqId,
      rfqDto,
      auctionDocFile,
      guidelineDocFile,
    );
  }

  @SerializeResponse(RFQResponse)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @Delete(':rfqId/delete-rfq')
  async closeRFQ(@Param('rfqId') rfqId: string): Promise<RFQ> {
    return this.rfqService.deleteRFQ(rfqId);
  }

  //download RFQ
  @UseGuards(JwtAuthGuard)
  @Get(':rfqId/:filename')
  async downloadFile(
    @Param('rfqId') rfqId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.rfqService.downloadFile(rfqId, filename, res);
  }
}
