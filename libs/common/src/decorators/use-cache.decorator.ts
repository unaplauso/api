import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UseInterceptors, applyDecorators } from '@nestjs/common';

export const UseCache = (op?: { ttl?: number; key?: string }) => {
	const decos = [
		UseInterceptors(CacheInterceptor),
		op?.ttl && CacheTTL(op.ttl),
		op?.key && CacheKey(op.key),
	].filter(Boolean) as Array<
		ClassDecorator | MethodDecorator | PropertyDecorator
	>;

	return applyDecorators(...decos);
};
