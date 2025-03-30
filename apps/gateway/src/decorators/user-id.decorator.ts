import {
	type ExecutionContext,
	PreconditionFailedException,
	createParamDecorator,
} from '@nestjs/common';

export const UserId = createParamDecorator(
	(allowNull: boolean, ctx: ExecutionContext) => {
		const { user } = ctx.switchToHttp().getRequest();
		if (!user?.id && !allowNull) throw new PreconditionFailedException();
		return user.id;
	},
);
