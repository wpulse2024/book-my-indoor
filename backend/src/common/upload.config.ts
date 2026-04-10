import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

function imageUploadOptions(destination: string, prefix: string) {
  return {
    storage: diskStorage({
      destination,
      filename: (
        _req: any,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
      ) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${prefix}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: (
      _req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
        return cb(
          new BadRequestException(
            'Only image files (jpeg, png, webp, gif) are allowed',
          ),
          false,
        );
      }
      cb(null, true);
    },
  };
}

export const organizationLogoUploadOptions = imageUploadOptions(
  './uploads/organizations',
  'logo',
);

export const categoryImageUploadOptions = imageUploadOptions(
  './uploads/categories',
  'image',
);

export const venueImagesUploadOptions = imageUploadOptions(
  './uploads/venues',
  'venue',
);
