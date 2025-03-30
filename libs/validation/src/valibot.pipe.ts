import {
	type ArgumentMetadata,
	BadRequestException,
	Injectable,
	type Paramtype,
	type PipeTransform,
} from '@nestjs/common';
import { type GenericSchema, safeParseAsync } from 'valibot';
import { IS_DEVELOPMENT } from '.';

@Injectable()
export class ValibotPipe implements PipeTransform {
	constructor(
		private readonly schema: GenericSchema,
		private readonly type: Paramtype = 'param',
		private readonly paramName?: string,
	) {}

	async transform(value: unknown, metadata: ArgumentMetadata) {
		if (
			metadata.type !== this.type ||
			(this.paramName && this.paramName !== metadata.data)
		)
			return value;

		const v =
			metadata.data && metadata.type !== 'param'
				? (value as Record<string, unknown>)[metadata.data]
				: value;

		const result = await safeParseAsync(this.schema, v, {
			abortEarly: !IS_DEVELOPMENT,
		});

		if (!result.success)
			throw new BadRequestException(
				!IS_DEVELOPMENT ? undefined : result.issues,
			);

		return result.output;
	}
}
