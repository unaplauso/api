import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperGuard implements CanActivate {
  private readonly SUPER_API_KEY: string;
  constructor(private readonly config: ConfigService) {
    this.SUPER_API_KEY = this.config.get('SUPER_API_KEY', 'x-api-key');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return (
      request.headers['x-api-key'] === this.SUPER_API_KEY ||
      process.env.NODE_ENV !== 'production'
    );
  }
}
