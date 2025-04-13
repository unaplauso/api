import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { LowThrottle } from '@unaplauso/common/decorators';
import {
	ApiFileBody,
	FileInterceptor,
	FilesInterceptor,
	type MulterField,
	type MulterOptions,
} from '@webundsoehne/nest-fastify-file-upload';

export const ReceivesFile = (
	field: MulterField & { required?: boolean } = {
		name: 'file',
		required: true,
	},
	op?: MulterOptions,
) =>
	applyDecorators(
		ApiConsumes('multipart/form-data'),
		field.maxCount
			? ApiBody({
					schema: {
						type: 'object',
						properties: {
							[field.name]: {
								type: 'array',
								items: {
									type: 'string',
									format: 'binary',
									maxItems: field.maxCount,
								},
							},
						},
						required: [field.required ? field.name : undefined].filter(
							Boolean,
						) as string[],
					},
				})
			: ApiFileBody(field.name),
		UseInterceptors(
			field.maxCount
				? FilesInterceptor(field.name, field.maxCount, op)
				: FileInterceptor(field.name, op),
		),
		LowThrottle(),
	);
