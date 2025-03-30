import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Put,
} from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import { FileType, type S3Bucket } from '@unaplauso/database';
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
import { Validate, ValidateParam } from '@unaplauso/validation';
import {
	type TUpdateUser,
	UpdateUserSchema,
} from '@unaplauso/validation/types';
import { USERNAME_REGEX } from '@unaplauso/validation/utils';
import type { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { firstValueFrom } from 'rxjs';
import * as v from 'valibot';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('user')
export class UserController {
	constructor(@InjectClient() private readonly client: InternalService) {}

	@JwtProtected()
	@Get()
	async readUser(@UserId() userId: number) {
		return this.client.send(Service.AUDIT, 'read_user', userId);
	}

	@ValidateParam('username', v.pipe(v.string(), v.regex(USERNAME_REGEX)))
	@Get('exists/:username')
	async readUserExists(@Param('username') username: string) {
		return this.client.send(Service.OPEN, 'read_user_exists', username);
	}

	@JwtProtected()
	@NoContent()
	@Validate('body', UpdateUserSchema)
	@Patch()
	updateUser(@UserId() userId: number, @Body() dto: TUpdateUser) {
		return this.client.send(Service.AUDIT, 'update_user', { ...dto, userId });
	}

	@JwtProtected()
	@ReceivesFile()
	@Put('profile-pic')
	async putProfilePic(
		@UserId() userId: number,
		@File({ ext: FileExt.IMAGE })
		file: MulterFile,
	) {
		const data = await firstValueFrom<{ id: string; bucket: S3Bucket }>(
			await this.client.send<{ id: string; bucket: S3Bucket }, SyncFile>(
				Service.FILE,
				'sync_file',
				{
					file,
					userId,
					type: FileType.PROFILE_PIC,
				},
			),
		);

		this.client.emit(Service.EVENT, 'file_uploaded', {
			...data,
			mimetype: file.mimetype,
		});

		return data;
	}

	@JwtProtected()
	@ReceivesFile()
	@Put('profile-banner')
	async putProfileBanner(
		@UserId() userId: number,
		@File({ ext: FileExt.IMAGE })
		file: MulterFile,
	) {
		const data = await firstValueFrom<{ id: string; bucket: S3Bucket }>(
			await this.client.send<{ id: string; bucket: S3Bucket }, SyncFile>(
				Service.FILE,
				'sync_file',
				{
					file,
					userId,
					type: FileType.PROFILE_BANNER,
				},
			),
		);

		this.client.emit(Service.EVENT, 'file_uploaded', {
			...data,
			mimetype: file.mimetype,
		});

		return data;
	}

	@JwtProtected()
	@NoContent()
	@Delete('profile-pic')
	async deleteProfilePic(@UserId() userId: number) {
		return this.client.send<true, SyncDeleteFile>(Service.FILE, 'delete_file', {
			type: FileType.PROFILE_PIC,
			userId,
		});
	}

	@JwtProtected()
	@NoContent()
	@Delete('profile-banner')
	async deleteProfileBanner(@UserId() userId: number) {
		return this.client.send<true, SyncDeleteFile>(Service.FILE, 'delete_file', {
			type: FileType.PROFILE_BANNER,
			userId,
		});
	}
}
