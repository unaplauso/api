import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { SuperGuard } from '../auth/super.guard';

export const SuperProtected = () =>
	applyDecorators(
		ApiBasicAuth(),
		ApiTags('Administration'),
		UseGuards(SuperGuard),
	);
