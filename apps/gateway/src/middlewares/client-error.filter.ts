import { type ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import type { FastifyReply } from 'fastify';

@Catch()
export class ClientErrorFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(ClientErrorFilter.name);

	catch(
		e: {
			status?: number;
			response: { statusCode?: number; status: string | number };
		},
		host: ArgumentsHost,
	) {
		const code =
			(e?.response?.statusCode ?? e.response.status ?? e?.status) || 500;

		this.logger.error(e);
		return host
			.switchToHttp()
			.getResponse<FastifyReply>()
			.status(typeof code === 'number' ? code : 500)
			.send(IS_DEVELOPMENT ? { ...e } : undefined);
	}
}
