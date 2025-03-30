import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
	NotFoundException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NotFoundInterceptor<T = unknown> implements NestInterceptor {
	intercept(_: ExecutionContext, next: CallHandler): Observable<T> {
		return next.handle().pipe(
			map((data) => {
				if (data === null || data === undefined) throw new NotFoundException();
				return data;
			}),
		);
	}
}
