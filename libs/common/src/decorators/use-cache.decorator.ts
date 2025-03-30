import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { IS_DEVELOPMENT } from '@unaplauso/validation';

export const UseCache = (op?: { ttl?: number; key?: string }) => {
	if (IS_DEVELOPMENT) return applyDecorators();

	const decos = [
		UseInterceptors(CacheInterceptor),
		op?.ttl && CacheTTL(op.ttl),
		op?.key && CacheKey(op.key),
	].filter(Boolean) as Array<
		ClassDecorator | MethodDecorator | PropertyDecorator
	>;

	return applyDecorators(...decos);
};
