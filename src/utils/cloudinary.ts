// utils/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  secure: true,
});

// Define types for file input
export interface UploadFile {
  buffer?: Buffer; // e.g., from multer
  [key: string]: any; // allow extra fields like originalname, mimetype, etc.
}

/**
 * Uploads a file (Buffer or base64 string) to Cloudinary
 * Returns only the secure_url (string) for saving in DB
 */
export const uploadToCloudinary = async (
  file: UploadFile | string
): Promise<string> => {
  try {
    // If file is a buffer (from multer or form-data)
    if (typeof file !== "string" && file.buffer) {
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "food-app",
            timeout: 60000, // 60 second timeout
          },
          (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
            if (error) {
              console.error("Cloudinary upload stream error:", error);
              reject(new Error(`Upload failed: ${error.message || 'Unknown error'}`));
            } else {
              resolve(result?.secure_url || "");
            }
          }
        );

        const readable = new Readable();
        readable.push(file.buffer);
        readable.push(null);
        readable.pipe(uploadStream);

        // Add timeout handling for the stream
        const timeoutId = setTimeout(() => {
          reject(new Error('Upload timeout after 60 seconds'));
        }, 60000);

        uploadStream.on('finish', () => clearTimeout(timeoutId));
        uploadStream.on('error', () => clearTimeout(timeoutId));
      });
    }

    // If file is a base64 string
    if (typeof file === "string" && file.startsWith("data:")) {
      const result = await cloudinary.uploader.upload(file, {
        folder: "food-app",
        timeout: 60000,
      });
      return result.secure_url;
    }

    throw new Error("Invalid file format");
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    
    // Handle different error types
    if (error.error && error.error.message) {
      throw new Error(`Cloudinary error: ${error.error.message}`);
    } else if (error.message) {
      throw new Error(`Upload error: ${error.message}`);
    } else {
      throw new Error('Unknown upload error occurred');
    }
  }
};

/**
 * Deletes a file from Cloudinary by its publicId with proper error handling
 */
export const deleteFromCloudinary = async (
  publicId: string
): Promise<{ result: string }> => {
  try {
    // Add timeout wrapper using Promise.race
    const deletePromise = cloudinary.uploader.destroy(publicId);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Delete operation timeout after 30 seconds')), 30000);
    });

    const result = await Promise.race([deletePromise, timeoutPromise]);
    return result;
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    
    // Handle different error structures
    let errorMessage = 'Unknown delete error';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    throw new Error(`Failed to delete from Cloudinary: ${errorMessage}`);
  }
};

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicId = (url: string): string => {
  try {
    // Handle Cloudinary URLs like:
    // https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public-id.jpg
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return '';
    
    // Get everything after 'upload' and version (if present)
    let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    
    // Remove version if present (starts with 'v' followed by numbers)
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
};

export default cloudinary;