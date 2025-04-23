import { Buffer } from 'buffer'; // Ensure Buffer is imported

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { protectedProcedure, router } from '@/lib/trpc/server';

// Initialize S3 client (ensure environment variables are set)
const s3Client = new S3Client({
  region: process.env.R2_REGION || 'auto', // Provide a default or ensure it's set
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_DOMAIN = process.env.R2_DOMAIN!; // Public domain for accessing files

// Define error messages for consistency
enum ErrorMessage {
  NO_IMAGE_DATA_OR_TYPE = 'No image data or type provided',
  FILE_SIZE_TOO_LARGE = 'File size exceeds 10MB limit',
  UPLOAD_FAILED = 'Failed to upload file',
  INVALID_IMAGE_TYPE = 'Invalid image type format provided',
  MISSING_CONFIG = 'Server configuration error for file upload',
}

export const fileRouter = router({
  uploadFile: protectedProcedure // Use protectedProcedure assuming uploads require auth
    .input(
      z.object({
        // Validate base64 data: check if it starts with data:image/[type];base64, or is just base64
        data: z.string().min(1, ErrorMessage.NO_IMAGE_DATA_OR_TYPE),
        // Validate type: ensure it's in the format "image/xxx"
        type: z
          .string()
          .regex(
            /^image\/(png|jpeg|jpg|gif|webp)$/,
            ErrorMessage.INVALID_IMAGE_TYPE,
          ), // More specific image types
      }),
    )
    .mutation(async ({ input }) => {
      const { data: imageData, type } = input;

      // Ensure R2 configuration is present
      if (
        !BUCKET_NAME ||
        !R2_DOMAIN ||
        !process.env.R2_ENDPOINT ||
        !process.env.R2_ACCESS_KEY_ID ||
        !process.env.R2_SECRET_ACCESS_KEY
      ) {
        console.error('R2 environment variables missing!');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: ErrorMessage.MISSING_CONFIG,
        });
      }

      // Remove Base64 prefix if present
      const base64Data = imageData.startsWith(`data:${type};base64,`)
        ? imageData.replace(`data:${type};base64,`, '')
        : imageData;

      let buffer: Buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.error('Error decoding base64 string:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid base64 image data.',
        });
      }

      // Check file size (e.g., 10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
      if (buffer.byteLength > MAX_FILE_SIZE) {
        throw new TRPCError({
          code: 'PAYLOAD_TOO_LARGE',
          message: ErrorMessage.FILE_SIZE_TOO_LARGE,
        });
      }

      try {
        // Extract file extension, default to 'jpg' if split fails unexpectedly
        const fileExtension = type.split('/')[1] || 'jpg';
        const key = `uploads/${uuidv4()}.${fileExtension}`; // Store in an 'uploads' directory

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: type,
          // ACL: 'public-read', // Depending on your R2/S3 bucket policy, you might need this or configure bucket policy
        });

        await s3Client.send(command);

        // Construct the public URL
        // Ensure R2_DOMAIN does not end with a slash, and key does not start with one.
        const fileUrl = `${R2_DOMAIN.replace(/\/$/, '')}/${key}`;

        return { url: fileUrl };
      } catch (e) {
        console.error('R2 Upload error:', e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: ErrorMessage.UPLOAD_FAILED,
          cause: e, // Include original error for server logs
        });
      }
    }),
});

// Export the type of the router (optional but good practice)
export type FileRouter = typeof fileRouter;
