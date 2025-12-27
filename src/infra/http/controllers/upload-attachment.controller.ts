import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

const maxFileSize2MB = 1024 * 1024 * 2;
const acceptedFileTypes = '.(png|jpg|jpeg|webp|pdf)';

@Controller('/attachments')
export class UploadAttachmentController {
  constructor() {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: maxFileSize2MB }),
          new FileTypeValidator({ fileType: acceptedFileTypes }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file);
  }
}
