import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RFQRepository } from '../persistence/rfq.repository';
import { createRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { RFQ } from '../persistence/rfq.entity';
import { UserRepository } from 'src/modules/user/persistence/user.repository';
import { Role } from 'src/modules/user/utility/enums/role.enum';


@Injectable()
export class RFQService {
  constructor(
    private readonly rfqRepository: RFQRepository,
    private readonly userRepository: UserRepository
  ) { }

  async createRFQ(buyerId: string, rfqDto: createRFQDTO): Promise<RFQ> {
    const user = await this.userRepository.findById(buyerId);
    if (!user || user.lastRole !== Role.BUYER) {
      throw new Error('Only buyers can create RFQs');
    }
    const { productName } = rfqDto;
    const existingProduct = await this.rfqRepository.findProductByName(productName);
    if (existingProduct) {
      throw new ConflictException('Product with the same name already exists');
    }
    return this.rfqRepository.createRFQ(rfqDto, user);
  }

  async viewRFQ(id: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    return rfq;
  }

  async editRFQ(id: string, buyerId: string, rfqDto: UpdateRFQDTO): Promise<RFQ> {
    const existingRFQ = await this.rfqRepository.getRFQById(id);
    const user = await this.userRepository.findById(buyerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!existingRFQ) {
      throw new NotFoundException('RFQ not found');
    }
    if (existingRFQ.user.id !== user.id) {
      throw new ForbiddenException('Only the creator of the RFQ can edit it');
    }
    return this.rfqRepository.updateRFQ(rfqDto);
  }


  async openRFQ(rfqId: string, buyerId: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(rfqId);
    const user = await this.userRepository.findById(buyerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.lastRole !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can Open RFQs');
    }
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    if (rfq.user.id !== user.id) {
      throw new ForbiddenException('Only the creator of the RFQ can update it');
    }
    rfq.state = true;
    return this.rfqRepository.updateRFQ(rfq);
  }


  async closeRFQ(rfqId: string, buyerId: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(rfqId);
    const user = await this.userRepository.findById(buyerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.lastRole !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can close RFQs');
    }
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    if (rfq.user.id !== user.id) {
      throw new ForbiddenException('Only the creator of the RFQ can close it');
    }
    rfq.state = false;

    return this.rfqRepository.updateRFQ(rfq);
  }

}