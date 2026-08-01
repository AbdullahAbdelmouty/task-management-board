import {
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request.user;
});
