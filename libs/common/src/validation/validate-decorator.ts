import { applyDecorators, Paramtype, UsePipes } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { toJsonSchema } from '@valibot/to-json-schema';
import { GenericSchema } from 'valibot';
import { ValibotPipe } from './valibot.pipe';

export const Validate = (
  paramType: Paramtype,
  genericSchema: GenericSchema,
  paramName = '',
) => {
  const schema = toJsonSchema(genericSchema, {
    errorMode: 'ignore',
  }) as SchemaObject;

  return applyDecorators(
    UsePipes(new ValibotPipe(genericSchema, paramType)),
    paramType === 'body'
      ? ApiBody({ schema })
      : paramType === 'query'
        ? ApiQuery({ schema })
        : ApiParam({ name: paramName, schema }),
  );
};
