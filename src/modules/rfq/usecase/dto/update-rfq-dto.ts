import { PartialType } from '@nestjs/mapped-types';
import { createRFQDTO } from './create-rfq-dto';

export class UpdateRFQDTO extends PartialType(createRFQDTO) {}
