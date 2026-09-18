const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'music');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `music-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const uploadMusic = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/webm',
      'audio/mp4',
      'audio/aac'
    ];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      return cb(null, true);
    }
    return cb(new Error('Invalid audio format. Use MP3, WAV, OGG, WEBM, MP4, or AAC.'), false);
  },
  limits: { fileSize: 25 * 1024 * 1024 }
});

module.exports = uploadMusic;