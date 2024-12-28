import { Body, PipeTransform, Type } from '@nestjs/common';
import { UnknownBaseSchema } from '../interfaces/unknown-base-schema.interface';
import { ValibotPipe } from '../pipes/valibot.pipe';

export const VBody = (
  schema: UnknownBaseSchema,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) => Body(new ValibotPipe(schema), ...pipes);
