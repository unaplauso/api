import {
	Catch,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { IS_DEVELOPMENT } from '@unaplauso/validation';

@Catch(Error)
export class DatabaseErrorFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(DatabaseErrorFilter.name);

	catch(e: object & { code?: string }) {
		const error = IS_DEVELOPMENT ? e : undefined;

		if (e?.code === '23503') throw new NotFoundException(error);

		this.logger.error(error);
		throw new InternalServerErrorException(error);
	}
}
