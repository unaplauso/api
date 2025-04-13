import {
	Catch,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	PreconditionFailedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { IS_DEVELOPMENT } from '@unaplauso/validation';

@Catch(Error)
export class ServiceErrorFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(ServiceErrorFilter.name);

	catch(e: object & { code?: string; message?: string }) {
		const error = IS_DEVELOPMENT ? e : undefined;

		if (e.code === '23503') throw new NotFoundException(error);
		if (e.message?.includes('limit_exception'))
			throw new PreconditionFailedException(error);

		this.logger.error(error);
		throw new InternalServerErrorException(error);
	}
}
