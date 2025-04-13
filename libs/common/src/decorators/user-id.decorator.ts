import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UserId = createParamDecorator(
	(_: unknown, ctx: ExecutionContext) => {
		const { user } = ctx.switchToHttp().getRequest();
		return user?.id ?? null;
	},
);
