import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { NO_CONTENT_KEY } from '@unaplauso/common/decorators';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ValidResponseInterceptor<T = unknown> implements NestInterceptor {
	constructor(private reflector: Reflector) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
		const noContent = this.reflector.get<boolean>(
			NO_CONTENT_KEY,
			context.getHandler(),
		);

		return next
			.handle()
			.pipe(
				map((data) => (noContent ? true : data === undefined ? null : data)),
			);
	}
}
