import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
  Patch,
  UploadedFiles,
  UsePipes,
} from '@nestjs/common';
import { BidService } from '../usecase/bid.service';
import { Bid } from '../persistence/bid.entity';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { RoleGuard } from 'src/modules/common/guards/role.guard';
import { Roles } from 'src/modules/common/roles.decorator';
import { Response } from 'express';
import { RequestLoggingInterceptor } from 'src/modules/common/request-logging.interceptor';
import { CreateBidDTO } from '../usecase/dto/create-bid.dto';
import { BidResponse } from '../usecase/dto/bid-response.dto';
import { UpdateBidDTO } from '../usecase/dto/update-bid.dto';
import { ParseBidItemsPipe } from '../usecase/utility/bid-tems.pipe';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  /**
   * Create a new Bid with a mandatory zip file
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Post('seller/:sellerId/create-bid')
  @UseInterceptors(FileInterceptor('bidFiles')) // Name must match the frontend
  async createBid(
    @Param('sellerId') sellerId: string,
    @UploadedFile() bidFiles: Express.Multer.File,
    @Body('data') rawBidData: string,
  ): Promise<Bid> {
    const parsedBidDto: CreateBidDTO = JSON.parse(rawBidData);
    console.log(bidFiles);
    return this.bidService.createBid(sellerId, parsedBidDto, {
      bidFiles: [bidFiles],
    });
  }

  /**
   * Get all Bids for an RFQ
   */
  // @SerializeResponse(BidResponse)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @UseGuards(JwtAuthGuard)
  @Get('rfq/:rfqId/view-all-bids')
  async findBidsByRFQ(@Param('rfqId') rfqId: string): Promise<Bid[]> {
    return this.bidService.findBidsByRFQ(rfqId);
  }

  /**
   * Get all Bids created by a seller
   */
  // @SerializeResponse(BidResponse)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Get('seller/:sellerId/view-all-bids')
  async findBidsByUser(@Param('sellerId') sellerId: string): Promise<Bid[]> {
    return this.bidService.findBidsByUser(sellerId);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @Get('state-count/:userId')
  async getBidStateCount(@Param('userId') userId: string) {
    return this.bidService.getBidStateCountForUser(userId);
  }

  /**
   * Get a specific Bid by ID
   */
  // @SerializeResponse(BidResponse)
  @UseGuards(JwtAuthGuard)
  @Get(':id/view-bid')
  async getBid(@Param('id') id: string): Promise<Bid> {
    return this.bidService.getBid(id);
  }

  /**
   * Delete a Bid (soft delete)
   */
  @SerializeResponse(BidResponse)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller') // Only the seller who created the bid can delete it
  @Delete(':bidId/delete-bid')
  async deleteBid(@Param('bidId') bidId: string): Promise<Bid> {
    return this.bidService.deleteBid(bidId);
  }

  /**
   * Download the bid zip file
   */
  @UseGuards(JwtAuthGuard)
  @Get(':bidId/file/:filename')
  async downloadBidFile(
    @Param('bidId') bidId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.bidService.downloadBidFile(bidId, filename, res);
  }

  @UseInterceptors(RequestLoggingInterceptor)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('seller')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'bidFiles', maxCount: 1 }]))
  @UsePipes(ParseBidItemsPipe)
  @Patch(':id/edit-bid')
  async editBid(
    @Param('id') id: string,
    @Body() bidDto: UpdateBidDTO,
    @UploadedFiles() files: { bidFiles?: Express.Multer.File[] },
  ): Promise<Bid> {
    console.log('Received bidDto:', bidDto); // Debug
    console.log('Received files:', files); // Debug
    const bidFilesFile = files.bidFiles?.[0];
    return this.bidService.editBid(id, bidDto, bidFilesFile);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @Patch('buyer/:bidId/award')
  async awardBid(@Param('bidId') bidId: string) {
    return this.bidService.awardBid(bidId);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('buyer')
  @Patch('buyer/:bidId/reject')
  async rejectBid(@Param('bidId') bidId: string) {
    return this.bidService.rejectBid(bidId);
  }
}
