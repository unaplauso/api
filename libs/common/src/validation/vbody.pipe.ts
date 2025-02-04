import { Body, PipeTransform, Type } from '@nestjs/common';
import { GenericSchema } from 'valibot';
import { ValibotPipe } from './valibot.pipe';

export const VBody = (
  schema: GenericSchema,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) => Body(new ValibotPipe(schema), ...pipes);
