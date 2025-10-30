import multer from 'multer';
import path from 'path';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 4 * 1024 * 1024 * 1024 // 4GB limit (max for videos, images will be validated separately)
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|mov|avi|webm|quicktime/;
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime'
    ];
    
    const extension = path.extname(file.originalname).toLowerCase();
    const isImage = allowedImageTypes.test(extension);
    const isVideo = allowedVideoTypes.test(extension);
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    
    if (!isValidMimeType || (!isImage && !isVideo)) {
      return cb(new Error('Only image (JPEG, PNG, GIF, WebP) and video (MP4, MOV, AVI, WebM) files allowed'), false);
    }
    
    // Check for zero-byte files
    if (file.size === 0) {
      return cb(new Error('File cannot be empty'), false);
    }
    
    // Check file size limits based on type
    if (isImage && file.size > 8 * 1024 * 1024) { // 8MB for images
      return cb(new Error('Image files must be under 8MB'), false);
    }
    
    if (isVideo && file.size > 4 * 1024 * 1024 * 1024) { // 4GB for videos
      return cb(new Error('Video files must be under 4GB'), false);
    }
    
    cb(null, true);
  }
});