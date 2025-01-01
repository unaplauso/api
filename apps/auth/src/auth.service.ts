import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDB, InsertUser, UserTable } from '@unaplauso/database';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import AccessData from './types/access-data.type';

@Injectable()
export class AuthService {
  private readonly FRONT_REDIRECT_URL: string;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @InjectDB() private readonly db: NodePgDatabase,
  ) {
    this.FRONT_REDIRECT_URL = this.config.getOrThrow('FRONT_REDIRECT_URL');
  }

  private getRefreshSecret() {
    return this.config.get('JWT_REFRESH_SECRET', 'secret');
  }

  private async issueTokens(id: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ id }),
      this.jwtService.signAsync(
        { id },
        {
          algorithm: 'HS512',
          secret: this.getRefreshSecret(),
          expiresIn: '30d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  getRedirectUrl(token: AccessData) {
    return `${this.FRONT_REDIRECT_URL}${JSON.stringify(token)}`;
  }

  async refreshToken(token: string) {
    try {
      const { id } = await this.jwtService.verifyAsync(token, {
        secret: this.getRefreshSecret(),
      });

      return this.issueTokens(id);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async handleOauth(user: InsertUser) {
    const { id } =
      (await this.db
        .select({ id: UserTable.id })
        .from(UserTable)
        .where(eq(UserTable.email, user.email)))![0] ??
      (
        await this.db
          .insert(UserTable)
          .values(user)
          .returning({ id: UserTable.id })
      )[0];

    return this.issueTokens(id);
  }
}
