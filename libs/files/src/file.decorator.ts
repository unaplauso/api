import {
	BadRequestException,
	ParseFilePipeBuilder,
	type PipeTransform,
	type Type,
	UploadedFile,
	UploadedFiles,
} from '@nestjs/common';
import { IS_DEVELOPMENT } from '@unaplauso/validation';

export enum FileExt {
	IMAGE = 'image/(jpeg|png|gif|webp|bmp|svg\\+xml)',
	ALL = '.*',
}

export type FileOptions = {
	fileKey?: string;
	isMultiple?: boolean;
	ext?: string | RegExp | FileExt;
	maxSize?: number;
	required?: false;
};

export const File = (
	op?: FileOptions,
	...pipes: (Type<PipeTransform> | PipeTransform)[]
) => {
	const filePipe = new ParseFilePipeBuilder()
		.addFileTypeValidator({
			fileType: op?.ext ?? FileExt.ALL,
		})
		.addMaxSizeValidator({
			maxSize: (op?.maxSize ?? 1) * 1024 * 1024,
		})
		.build({
			fileIsRequired: op?.required === undefined,
			exceptionFactory: (e) => {
				throw new BadRequestException(IS_DEVELOPMENT ? e : undefined);
			},
		});

	return op?.isMultiple
		? UploadedFiles(filePipe)
		: UploadedFile(op?.fileKey ?? 'file', filePipe, ...pipes);
};
