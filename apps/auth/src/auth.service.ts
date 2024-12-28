import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserInsertDto } from '@unaplauso/database';

@Injectable()
export class AuthService {
  private readonly FRONT_REDIRECT_URL: string;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.FRONT_REDIRECT_URL = this.config.getOrThrow('FRONT_REDIRECT_URL');
  }

  getRedirectUrl(token: string) {
    return `${this.FRONT_REDIRECT_URL}${token}`;
  }

  handleOauth(user: UserInsertDto) {
    console.log(user);
    // TODO: Guardar user si no existe + generar & devolver token
    return 'TOKEN';
  }
}
