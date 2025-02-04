import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { GenericSchema, safeParseAsync } from 'valibot';

@Injectable()
export class ValibotPipe implements PipeTransform {
  constructor(private readonly schema: GenericSchema) {}

  async transform(value: unknown) {
    const result = await safeParseAsync(this.schema, value);

    if (!result.success)
      throw new BadRequestException(
        process.env.NODE_ENV === 'production' ? undefined : result.issues,
      );

    return result.output;
  }
}
