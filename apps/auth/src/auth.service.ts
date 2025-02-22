import { Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectCache, InjectConfig } from '@unaplauso/common/decorators';
import { InjectDB, InsertUser, UserTable } from '@unaplauso/database';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import AccessData from './types/access-data.type';

@Injectable()
export class AuthService {
  private readonly FRONT_REDIRECT_URL: string;
  private readonly JWT_REFRESH_SECRET: string;

  constructor(
    @InjectConfig() private readonly config: ConfigService,
    @InjectCache() private readonly cache: Cache,
    @InjectDB() private readonly db: NodePgDatabase,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {
    this.FRONT_REDIRECT_URL = this.config.getOrThrow('FRONT_REDIRECT_URL');
    this.JWT_REFRESH_SECRET = this.config.get('JWT_REFRESH_SECRET', 'secret');
  }

  private async issueTokens(id: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ id }),
      this.jwt.signAsync(
        { id },
        {
          algorithm: 'HS512',
          secret: this.JWT_REFRESH_SECRET,
          expiresIn: '30d',
        },
      ),
    ]);

    // x * 86400000 = x days
    await this.cache.set(`${id}`, refreshToken, 30 * 86400000);
    return { accessToken, refreshToken };
  }

  getRedirectUrl(token: AccessData) {
    return `${this.FRONT_REDIRECT_URL}${JSON.stringify(token)}`;
  }

  async refreshToken(token: string) {
    try {
      const { id } = await this.jwt.verifyAsync(token, {
        secret: this.JWT_REFRESH_SECRET,
      });

      if ((await this.cache.get<string>(`${id}`)) !== token) throw new Error();

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
