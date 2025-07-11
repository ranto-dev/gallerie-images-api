const express = require("express");
const { createUser, getAllUser } = require("../controllers/user.controller");
const router = express.Router();

router.post("/new-account", createUser);
router.get("/all", getAllUser);

module.exports = router;
