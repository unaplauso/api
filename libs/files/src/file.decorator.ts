import {
  BadRequestException,
  ParseFilePipeBuilder,
  PipeTransform,
  Type,
  UploadedFile,
} from '@nestjs/common';
import { IS_DEVELOPMENT } from '@unaplauso/validation';

export enum FileExt {
  IMAGE = 'image/(jpeg|png|gif|webp|bmp|svg\\+xml)',
  ALL = '.*',
}

export type FileOptions = {
  fileKey?: string;
  ext?: string | RegExp | FileExt;
  maxSize?: number;
  required?: false;
};

export const File = (
  op?: FileOptions,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) =>
  UploadedFile(
    op?.fileKey ?? 'file',
    new ParseFilePipeBuilder()
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
      }),
    ...pipes,
  );
