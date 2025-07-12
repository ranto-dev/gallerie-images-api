const express = require("express");
const {
  createUser,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/user.controller");
const router = express.Router();

router.post("/new-account", createUser);
router.get("/all", getAllUser);
router.get("/find/:id", getUserById);
router.patch("/edit/:id", updateUserById);
router.delete("/delete/:id", deleteUserById);

module.exports = router;
