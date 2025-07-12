const express = require("express");
const {
  createUser,
  getAllUser,
  getUserById,
} = require("../controllers/user.controller");
const router = express.Router();

router.post("/new-account", createUser);
router.get("/all", getAllUser);
router.get("/find/:id", getUserById);

module.exports = router;
