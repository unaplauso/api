import {
	type CanActivate,
	type ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
	private readonly JWT_SECRET: string;
	constructor(
		@Inject(JwtService) private readonly jwt: JwtService,
		@Inject(ConfigService) private readonly config: ConfigService,
		@Inject(Reflector) private readonly reflector: Reflector,
	) {
		this.JWT_SECRET = this.config.getOrThrow('JWT_SECRET');
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const strict =
			this.reflector.get<boolean>('strict', context.getHandler()) ?? true;

		console.log('HOLA!', strict);
		const request = context.switchToHttp().getRequest();
		const [method, token] = request.headers.authorization?.split(' ') ?? [];
		if (strict && (method !== 'Bearer' || !token))
			throw new UnauthorizedException();

		try {
			request.user = await this.jwt.verifyAsync(token, {
				secret: this.JWT_SECRET,
			});
		} catch {
			if (!strict) return true;
			throw new UnauthorizedException();
		}

		return Boolean(request.user);
	}
}
