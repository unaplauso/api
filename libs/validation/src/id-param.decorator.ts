import { Param } from '@nestjs/common';
import * as v from 'valibot';
import { vStringInt } from './utils';
import { ValibotPipe } from './valibot.pipe';

export const IdParam = (key = 'id', type = 'number') =>
	Param(
		key,
		new ValibotPipe(
			type === 'uuid' ? v.pipe(v.string(), v.uuid()) : vStringInt,
			'param',
			key,
		),
	);
