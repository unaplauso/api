import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { safeParse } from 'valibot';
import { UnknownBaseSchema } from '../interfaces/unknown-base-schema.interface';

@Injectable()
export class ValibotPipe implements PipeTransform {
  constructor(private readonly schema: UnknownBaseSchema) {}

  transform(value: unknown) {
    const result = safeParse(this.schema, value);
    if (!result.success) throw new BadRequestException(result.issues);
    return result.output;
  }
}
