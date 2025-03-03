import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import {
  DefaultPaginationSchema,
  Pagination,
} from '@unaplauso/common/pagination';
import { Validate } from '@unaplauso/common/validation';
import { InjectClient, InternalService, Service } from '@unaplauso/services';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('favorite')
export class FavoriteController {
  constructor(@InjectClient() private readonly client: InternalService) {}

  @JwtProtected()
  @NoContent()
  @Post('creator/:id')
  async createFavoriteCreator(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) creatorId: number,
  ) {
    return this.client.send(Service.AUDIT, 'create_favorite_creator', {
      userId,
      creatorId,
    });
  }

  @JwtProtected()
  @NoContent()
  @Delete('creator/:id')
  async deleteFavoriteCreator(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) creatorId: number,
  ) {
    return this.client.send(Service.AUDIT, 'delete_favorite_creator', {
      userId,
      creatorId,
    });
  }

  @JwtProtected()
  @Validate('query', DefaultPaginationSchema)
  @Get('creator')
  async listFavoriteCreator(
    @UserId() userId: number,
    @Query() pagination: Pagination,
  ) {
    return this.client.send(Service.AUDIT, 'list_favorite_creator', {
      userId,
      pagination,
    });
  }

  @JwtProtected()
  @NoContent()
  @Post('project/:id')
  async createFavoriteProject(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return this.client.send(Service.AUDIT, 'create_favorite_project', {
      userId,
      projectId,
    });
  }

  @JwtProtected()
  @NoContent()
  @Delete('project/:id')
  async deleteFavoriteProject(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return this.client.send(Service.AUDIT, 'delete_favorite_project', {
      userId,
      projectId,
    });
  }

  @JwtProtected()
  @Validate('query', DefaultPaginationSchema)
  @Get('project')
  async listFavoriteProject(
    @UserId() userId: number,
    @Query() pagination: Pagination,
  ) {
    return this.client.send(Service.AUDIT, 'list_favorite_project', {
      userId,
      pagination,
    });
  }
}
