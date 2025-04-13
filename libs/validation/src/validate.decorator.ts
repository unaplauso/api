import { type Paramtype, UsePipes, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { toJsonSchema } from '@valibot/to-json-schema';
import type { GenericSchema } from 'valibot';
import { ValibotPipe } from './valibot.pipe';

export function Validate(
	paramType: Paramtype,
	genericSchema: GenericSchema,
	paramName?: string,
	fileKeys = ['file', 'files'], // para fixar JSON Schema
) {
	const schema = toJsonSchema(genericSchema, {
		errorMode: 'ignore',
	}) as SchemaObject;

	for (const fileKey of fileKeys)
		if (schema.properties?.[fileKey])
			schema.properties[fileKey] =
				(schema.properties[fileKey] as { type: string }).type === 'array'
					? { type: 'array', items: { type: 'string', format: 'binary' } }
					: { type: 'string', format: 'binary' };

	return applyDecorators(
		UsePipes(new ValibotPipe(genericSchema, paramType, paramName)),
		paramType === 'body'
			? ApiBody({ schema })
			: paramType === 'query'
				? ApiQuery({ name: 'query', required: false, schema })
				: ApiParam({ name: paramName ?? '', schema }),
	);
}

export function ValidateParam(paramKey: string, genericSchema: GenericSchema) {
	return Validate('param', genericSchema, paramKey);
}
