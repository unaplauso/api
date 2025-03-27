import {
	type ExecutionContext,
	PreconditionFailedException,
	createParamDecorator,
} from '@nestjs/common';

export const UserId = createParamDecorator(
	(_: unknown, ctx: ExecutionContext) => {
		const { user } = ctx.switchToHttp().getRequest();
		if (!user?.id) throw new PreconditionFailedException();
		return user.id;
	},
);
