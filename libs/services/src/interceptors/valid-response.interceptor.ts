import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NO_CONTENT_KEY } from '../no-content.decorator';

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
