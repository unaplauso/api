import { HttpModule, type HttpModuleAsyncOptions } from '@nestjs/axios';

export const LocalHttpModule = (op?: HttpModuleAsyncOptions) =>
	HttpModule.registerAsync({
		useFactory: () => ({
			timeout: 5000,
			maxRedirects: 3,
			...op,
		}),
	});
