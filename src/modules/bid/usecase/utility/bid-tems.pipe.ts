// parse-bid-items.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBidItemsPipe implements PipeTransform {
  transform(value: any) {
    if (value.bidItems && typeof value.bidItems === 'string') {
      try {
        const parsed = JSON.parse(value.bidItems);
        if (!Array.isArray(parsed)) {
          throw new BadRequestException('Bid items must be an array');
        }
        if (
          !parsed.every(
            (item) => item && typeof item === 'object' && !Array.isArray(item),
          )
        ) {
          throw new BadRequestException('Each bid item must be an object');
        }
        value.bidItems = parsed;
      } catch (e) {
        throw new BadRequestException(
          'Bid items must be a valid JSON array of objects',
        );
      }
    }
    return value;
  }
}
