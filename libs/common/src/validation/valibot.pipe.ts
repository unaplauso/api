import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { GenericSchema, safeParseAsync } from 'valibot';
import { IS_DEVELOPMENT } from '.';

@Injectable()
export class ValibotPipe implements PipeTransform {
  constructor(private readonly schema: GenericSchema) {}

  async transform(value: unknown) {
    const result = await safeParseAsync(this.schema, value);

    if (!result.success)
      throw new BadRequestException(
        !IS_DEVELOPMENT ? undefined : result.issues,
      );

    return result.output;
  }
}
