import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';
import { Service } from '../service.enum';

@Injectable()
export class InternalService {
  constructor(@Inject('REDIS_CLIENT') private client: ClientProxy) {}

  async send<T>(
    service: Service,
    cmd: string,
    body?: unknown,
    emit = false,
    addToPattern?: object,
  ) {
    return this.client[emit ? 'emit' : 'send']<T>(
      { service, cmd, ...addToPattern },
      body || {},
    ).pipe(timeout(5000));
  }
}
