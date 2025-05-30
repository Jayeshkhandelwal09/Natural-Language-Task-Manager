import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['.mp3', '.wav', '.m4a', '.mp4', '.mpeg', '.mpga', '.webm'];
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/m4a',
    'audio/webm',
    'video/mp4',  // Some mp4 files are audio-only
    'video/webm'  // Some webm files are audio-only
  ];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  // Log file information before validation
  console.log('Pre-validation file info:', {
    fieldname: file.fieldname,
    originalName: file.originalname,
    encoding: file.encoding,
    mimeType: file.mimetype,
    size: file.size,
    extension: fileExtension
  });
  
  // Check file extension
  if (!allowedTypes.includes(fileExtension)) {
    return cb(new Error(`Invalid file extension: ${fileExtension}. Allowed types: ${allowedTypes.join(', ')}`));
  }

  // Check mime type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid mime type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`));
  }

  cb(null, true);
};

// 25MB in bytes
const MAX_FILE_SIZE = 25 * 1024 * 1024;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const audioUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Allow only 1 file per request
  }
}); 