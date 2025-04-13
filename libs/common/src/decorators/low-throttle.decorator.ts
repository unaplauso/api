import { Throttle, type ThrottlerModuleOptions } from '@nestjs/throttler';

export const LowThrottle = (options?: Record<string, ThrottlerModuleOptions>) =>
	Throttle({
		default: { limit: 2, ttl: 10000, blockDuration: 15000 },
		...options,
	});
