const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage dynamique via req.categorie
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.categorie || 'default';
    const uploadDir = path.join('uploads', category);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sauvegarder pour usage ultérieur
    req.uploadedCategoryPath = uploadDir;

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + fileExtension);
  }
});

// Filtre MIME
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls les fichiers JPEG, PNG, GIF et WebP sont acceptés.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: fileFilter
});

const uploadSingle = upload.single('image');

const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Le fichier est trop volumineux. Taille maximale autorisée: 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Trop de fichiers. Maximum 1 fichier autorisé'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Champ de fichier inattendu. Utilisez le champ "image"'
      });
    }
  }

  if (err && err.message.includes('Type de fichier non autorisé')) {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  next(err);
};

// Supprimer un fichier
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du fichier:', err);
        reject(err);
      } else {
        console.log('Fichier supprimé:', filePath);
        resolve();
      }
    });
  });
};

const cleanupUploadedFile = (req) => {
  if (req.file) {
    deleteFile(req.file.path).catch(err => {
      console.error('Erreur lors du nettoyage du fichier:', err);
    });
  }
};

const deleteOldImage = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(__dirname, '..', imagePath);
    deleteFile(fullPath).catch(err => {
      console.error('Erreur lors de la suppression de l\'ancienne image:', err);
    });
  }
};

const generateImageUrl = (filename, category = 'default') => {
  return `/uploads/${category}/${filename}`;
};

// Middleware pour injecter la catégorie dans req
const defineCategory = (category) => {
  return (req, res, next) => {
    req.categorie = category;
    next();
  };
};

module.exports = {
  uploadSingle,
  handleMulterErrors,
  deleteFile,
  cleanupUploadedFile,
  deleteOldImage,
  generateImageUrl,
  defineCategory
};