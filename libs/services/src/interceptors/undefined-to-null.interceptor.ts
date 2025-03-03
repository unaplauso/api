import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UndefinedToNullInterceptor<T = unknown>
  implements NestInterceptor
{
  intercept(_: ExecutionContext, next: CallHandler): Observable<T> {
    return next
      .handle()
      .pipe(map((data) => (data === undefined ? null : data)));
  }
}
