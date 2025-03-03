import { applyDecorators } from '@nestjs/common';
import { MessagePattern, PatternMetadata } from '@nestjs/microservices';
import { Service } from '@unaplauso/services';

export const Pattern = (cmd: string, override?: PatternMetadata) =>
  applyDecorators(
    MessagePattern({ service: Service.OPEN, cmd, ...(override as object) }),
  );
