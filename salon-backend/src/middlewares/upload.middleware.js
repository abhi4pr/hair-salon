const multer = require('multer');
const imagekit = require('../config/imagekit');
const AppError = require('../../errors/AppError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new AppError('Only images and videos are allowed', 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadToImageKit = async (file, folder = 'salon-app') => {
  const response = await imagekit.upload({
    file: file.buffer,
    fileName: `${Date.now()}_${file.originalname}`,
    folder,
  });
  return { url: response.url, fileId: response.fileId };
};

const deleteFromImageKit = async (fileId) => {
  if (!fileId) return;
  try {
    await imagekit.deleteFile(fileId);
  } catch (err) {
    console.error('[ImageKit delete error]', err.message);
  }
};

module.exports = { upload, uploadToImageKit, deleteFromImageKit };
