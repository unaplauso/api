import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { IS_DEVELOPMENT } from '@unaplauso/validation';

@Injectable()
export class SuperGuard implements CanActivate {
	private readonly SUPER_API_KEY: string;
	constructor(private readonly config: ConfigService) {
		this.SUPER_API_KEY = this.config.get('SUPER_API_KEY', 'x-api-key');
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		return (
			request.headers['x-api-key'] === this.SUPER_API_KEY || IS_DEVELOPMENT
		);
	}
}
