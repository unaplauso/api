import { SetMetadata } from '@nestjs/common';

export const NO_CONTENT_KEY = 'no-content';
export const NoContent = () => SetMetadata(NO_CONTENT_KEY, true);
