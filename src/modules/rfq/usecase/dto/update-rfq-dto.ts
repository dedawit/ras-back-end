import { PartialType } from '@nestjs/mapped-types';
import { CreateRFQDTO } from './create-rfq-dto';

export class UpdateRFQDTO extends PartialType(CreateRFQDTO) {}
