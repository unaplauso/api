import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../guards';

export type JwtProtectedOptions = {
	strict: boolean;
};

export const JwtProtected = (op?: JwtProtectedOptions) =>
	applyDecorators(
		ApiBearerAuth(),
		SetMetadata('strict', op?.strict ?? true),
		UseGuards(JwtGuard),
	);
