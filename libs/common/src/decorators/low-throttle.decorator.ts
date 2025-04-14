import { Throttle, type ThrottlerModuleOptions } from '@nestjs/throttler';

export const LowThrottle = (options?: Record<string, ThrottlerModuleOptions>) =>
	Throttle({
		default: { limit: 3, ttl: 10000, blockDuration: 15000 },
		...options,
	});
