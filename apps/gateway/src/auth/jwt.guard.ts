import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly JWT_SECRET: string;
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.JWT_SECRET = this.config.getOrThrow('JWT_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [method, token] = request.headers.authorization?.split(' ') ?? [];
    if (method !== 'Bearer' || !token) throw new UnauthorizedException();

    try {
      request['user'] = await this.jwt.verifyAsync(token, {
        secret: this.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException();
    }

    return Boolean(request['user']);
  }
}
