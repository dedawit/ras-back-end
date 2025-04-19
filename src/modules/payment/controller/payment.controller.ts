// payment.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PaymentService } from '../usecase/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('verify')
  async handleChapaCallback(
    @Query('trx_ref') trxRef: string,
    @Query('status') status: string,
    @Query('ref_id') refId: string,
  ) {
    // Log the incoming callback info (optional)
    console.log('Chapa Callback:', { trxRef, refId, status });

    // Always verify the status with Chapa directly
    return this.paymentService.verifyChapaPayment(trxRef);
  }
}
