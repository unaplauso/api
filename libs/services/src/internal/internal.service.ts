import { Inject, Injectable } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';
import type { Service } from '../service.enum';

export type SendOptions = {
	emit?: boolean;
	addToPattern?: object;
	timeout?: number;
};

@Injectable()
export class InternalService {
	constructor(@Inject('REDIS_MS_CLIENT') private client: ClientProxy) {}

	async send<TRes = unknown, TReq = unknown>(
		service: Service,
		cmd: string,
		body?: TReq,
		op?: SendOptions,
	) {
		return this.client[op?.emit ? 'emit' : 'send']<TRes>(
			{ service, cmd, ...op?.addToPattern },
			body || {},
		).pipe(timeout(op?.timeout ?? 5000));
	}

	async emit<TRes = unknown, TReq = unknown>(
		service: Service,
		cmd: string,
		body?: TReq,
		op?: SendOptions,
	) {
		return this.send<TRes, TReq>(service, cmd, body, { ...op, emit: true });
	}
}
