import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Paramtype,
  PipeTransform,
} from '@nestjs/common';
import { GenericSchema, safeParseAsync } from 'valibot';
import { IS_DEVELOPMENT } from '.';

@Injectable()
export class ValibotPipe implements PipeTransform {
  constructor(
    private readonly schema: GenericSchema,
    private readonly type: Paramtype = 'body',
  ) {}

  async transform(value: unknown, metadata: ArgumentMetadata) {
    const v = metadata.data
      ? (value as Record<string, unknown>)[metadata.data]
      : value;

    if (metadata.type !== this.type) return v;

    const result = await safeParseAsync(this.schema, v);

    if (!result.success)
      throw new BadRequestException(
        !IS_DEVELOPMENT ? undefined : result.issues,
      );

    return result.output;
  }
}
