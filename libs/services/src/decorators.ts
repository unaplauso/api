import { applyDecorators } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Service } from './service.enum';

export function Pattern(
  service: Service,
  cmd: string,
  metadata?: Record<string, any>,
) {
  return applyDecorators(MessagePattern({ service, cmd, ...metadata }));
}
