import multer from 'multer';
import imagekit from '../config/imagekit.js';
import AppError from '../../errors/AppError.js';
import logger from '../config/logger.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new AppError('Only images and videos are allowed', 400), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadToImageKit = async (file, folder = 'salon-app') => {
  const response = await imagekit.upload({
    file: file.buffer,
    fileName: `${Date.now()}_${file.originalname}`,
    folder,
  });
  return { url: response.url, fileId: response.fileId };
};

export const deleteFromImageKit = async (fileId) => {
  if (!fileId) return;
  try {
    await imagekit.deleteFile(fileId);
  } catch (err) {
    logger.warn(`[ImageKit delete] ${err.message}`);
  }
};
