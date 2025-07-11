const express = require('express');
const router = express.Router();
const plageImageController = require('../controllers/plage_images.controller');
const {
  uploadSingle,
  handleMulterErrors,
  defineCategory,
  deleteOldImage
} = require('../middleware/multerConfig');

const pool = require('../config/db');

// Route GET toutes les images
router.get('/', );

// Route GET images d'une plage spécifique
router.get('/plage/:plage', plageImageController.getImagesByPlage);

// Route POST image
router.post('/',
  defineCategory('plage-images'), // Dossier uploads/plage-images
  uploadSingle,
  handleMulterErrors,
  plageImageController.addPlageImage
);

// Route PUT image (mise à jour image physique)
router.put('/:id',
  // Supprimer l'ancienne image du disque si elle existe
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM plage_image WHERE ID = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Image non trouvée' });
      }

      const oldImagePath = result.rows[0].image_url;
      if (oldImagePath) {
        deleteOldImage(oldImagePath); // Supprime l’image précédente du disque
      }
      next();
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'image de la plage à modifier :', err);
      return res.status(500).json({ error: 'Erreur serveur', message: err.message });
    }
  },
  defineCategory('plage-images'),
  uploadSingle,
  handleMulterErrors,
  plageImageController.updatePlageImage
);

// Middleware pour supprimer l'image physique avant suppression base de données
const removePhysicalImageBeforeDelete = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM Plage_image WHERE ID = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image non trouvée' });
    }

    const imagePath = result.rows[0].image_url;
    deleteOldImage(imagePath); // Supprime le fichier physique
    next();
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'image plage à supprimer :', err);
    return res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
};

// Route DELETE image
router.delete('/:id',
  removePhysicalImageBeforeDelete,
  plageImageController.deletePlageImage
);

module.exports = router;