import type { Cache } from '@nestjs/cache-manager';
import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import {
	InjectCache,
	JwtProtected,
	LowThrottle,
	NoContent,
	UseCache,
	UserId,
} from '@unaplauso/common/decorators';
import { FileType } from '@unaplauso/database';
import {
	File,
	FileExt,
	ReceivesFile,
	type SyncDeleteFile,
	type SyncFile,
} from '@unaplauso/files';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { IdParam, Validate } from '@unaplauso/validation';
import {
	type CreateProject,
	CreateProjectSchema,
	type ListProject,
	ListProjectSchema,
	type UpdateProject,
	UpdateProjectSchema,
} from '@unaplauso/validation/types';
import { isDefaultType } from '@unaplauso/validation/utils';
import type { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import * as v from 'valibot';

@Controller('project')
export class ProjectController {
	constructor(
		@InjectClient() private readonly client: InternalService,
		@InjectCache() private readonly cache: Cache,
	) {}

	@JwtProtected()
	@NoContent()
	@Validate('body', CreateProjectSchema)
	@Post()
	async createProject(@UserId() userId: number, @Body() dto: CreateProject) {
		return this.client.send(Service.AUDIT, 'create_project', {
			...dto,
			userId,
		});
	}

	@JwtProtected()
	@ReceivesFile({ name: 'files', maxCount: 5 })
	@Put(':id/files')
	async putProjectFiles(
		@UserId() userId: number,
		@IdParam() projectId: number,
		@File({ isMultiple: true, maxSize: 2 }) files: MulterFile[],
	) {
		return this.client.send<true, SyncFile>(Service.FILE, 'sync_file', {
			type: FileType.PROJECT_FILE,
			files,
			projectId,
			userId,
		});
	}

	@Validate('body', v.array(v.pipe(v.string(), v.uuid())))
	@JwtProtected()
	@NoContent()
	@Delete(':id/files')
	async deleteProjectFiles(
		@UserId() userId: number,
		@IdParam() projectId: number,
		@Body() fileIds: string[],
	) {
		return this.client.send<true, SyncDeleteFile>(Service.FILE, 'delete_file', {
			type: FileType.PROJECT_FILE,
			fileIds,
			userId,
			projectId,
		});
	}

	@JwtProtected()
	@ReceivesFile()
	@Put(':id/thumbnail')
	async putProjectThumbnail(
		@UserId() userId: number,
		@IdParam() projectId: number,
		@File({ ext: FileExt.IMAGE }) file: MulterFile,
	) {
		return this.client.send<true, SyncFile>(Service.FILE, 'sync_file', {
			type: FileType.PROJECT_THUMBNAIL,
			file,
			projectId,
			userId,
		});
	}

	@JwtProtected()
	@NoContent()
	@Delete(':id/thumbnail')
	async deleteProjectThumbnail(
		@UserId() userId: number,
		@IdParam() projectId: number,
	) {
		return this.client.send<true, SyncDeleteFile>(Service.FILE, 'delete_file', {
			type: FileType.PROJECT_THUMBNAIL,
			projectId,
			userId,
		});
	}

	@UseCache()
	@Get(':id')
	async readProject(@IdParam() id: number) {
		this.client.emit(Service.EVENT, 'project_read', id);
		return this.client.send(Service.OPEN, 'read_project', id);
	}

	@JwtProtected()
	@LowThrottle()
	@NoContent()
	@Validate('body', UpdateProjectSchema)
	@Patch(':id')
	async updateProject(
		@UserId() userId: number,
		@IdParam() projectId: number,
		@Body() dto: UpdateProject,
	) {
		return this.client.send(Service.AUDIT, 'update_project', {
			...dto,
			projectId,
			userId,
		});
	}

	@JwtProtected()
	@NoContent()
	@Delete(':id')
	async deleteProject(@UserId() userId: number, @IdParam() projectId: number) {
		return this.client.send(Service.AUDIT, 'delete_project', {
			userId,
			projectId,
		});
	}

	@Validate('query', ListProjectSchema)
	@UseCache()
	@Get()
	async listProject(@Query() dto: ListProject) {
		if (isDefaultType(ListProjectSchema, dto)) {
			const cached = await this.cache.get('top_project');
			if (cached) return cached;
			this.client.emit(Service.EVENT, 'refresh_top_project');
		}

		return this.client.send(Service.OPEN, 'list_project', dto);
	}
}
