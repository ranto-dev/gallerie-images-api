const pool = require("../config/db");

// GET - Toutes les images de plages
exports.getAllImages = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Images");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur DB:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// GET - Images d'une plage spécifique
exports.getImagesById = async (req, res) => {
  const { plageId } = req.params;

  if (!plageId || isNaN(plageId)) {
    return res.status(400).json({ error: "ID de plage invalide" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM Images WHERE PlageID = $1",
      [plageId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur DB:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// POST - Ajouter une image de plage
exports.addPlageImage = async (req, res) => {
  const { plageID } = req.body;
  const image_url = req.file?.path
    ? "/" + req.file.path.replace(/\\/g, "/")
    : null;

  if (!plageID || isNaN(plageID)) {
    return res
      .status(400)
      .json({ error: "PlageID est requis et doit être un nombre" });
  }

  if (!image_url || image_url.trim() === "") {
    return res.status(400).json({ error: "L'image est requise" });
  }

  if (image_url.length > 255) {
    return res
      .status(400)
      .json({ error: "L'URL de l'image ne doit pas dépasser 255 caractères" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO Plage_image (PlageID, Image_url) VALUES ($1, $2) RETURNING *",
      [plageID, image_url.trim()]
    );
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Image de plage créée avec succès",
    });
  } catch (err) {
    console.error("Erreur insertion:", err);
    if (err.code === "23503") {
      return res
        .status(400)
        .json({ error: "PlageID invalide - la plage n'existe pas" });
    }
    res.status(500).json({ error: "Erreur serveur", message: err.message });
  }
};

// PUT - Modifier une image de plage
exports.updatePlageImage = async (req, res) => {
  const { id } = req.params;
  const { plageID, image_url } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
  }

  if (plageID !== undefined && (isNaN(plageID) || plageID <= 0)) {
    return res
      .status(400)
      .json({ error: "PlageID doit être un nombre positif" });
  }

  if (image_url !== undefined) {
    if (!image_url || image_url.trim() === "") {
      return res
        .status(400)
        .json({ error: "L'URL de l'image ne peut pas être vide" });
    }
    if (image_url.length > 255) {
      return res.status(400).json({
        error: "L'URL de l'image ne doit pas dépasser 255 caractères",
      });
    }
    try {
      new URL(image_url); // Vérification URL
    } catch (err) {
      return res
        .status(400)
        .json({ error: "L'URL de l'image n'est pas valide" });
    }
  }

  try {
    const existing = await pool.query(
      "SELECT * FROM Plage_image WHERE ID = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Image non trouvée" });
    }

    const updateFields = [];
    const values = [];
    let idx = 1;

    if (plageID !== undefined) {
      updateFields.push(`PlageID = $${idx}`);
      values.push(plageID);
      idx++;
    }

    if (image_url !== undefined) {
      updateFields.push(`Image_url = $${idx}`);
      values.push(image_url.trim());
      idx++;
    }

    values.push(id);

    const result = await pool.query(
      `
      UPDATE Plage_image
      SET ${updateFields.join(", ")}
      WHERE ID = $${idx}
      RETURNING *
    `,
      values
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Image mise à jour avec succès",
    });
  } catch (err) {
    console.error("Erreur update:", err);
    res.status(500).json({ error: "Erreur serveur", message: err.message });
  }
};

// DELETE - Supprimer une image de plage
exports.deletePlageImage = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }

  try {
    const existing = await pool.query(
      "SELECT * FROM Plage_image WHERE ID = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Image non trouvée" });
    }

    const recordToDelete = existing.rows[0];

    await pool.query("DELETE FROM Plage_image WHERE ID = $1", [id]);

    res.status(200).json({
      success: true,
      data: recordToDelete,
      message: "Image supprimée avec succès",
    });
  } catch (err) {
    console.error("Erreur suppression:", err);
    res.status(500).json({ error: "Erreur serveur", message: err.message });
  }
};
