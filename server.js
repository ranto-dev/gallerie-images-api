const express = require("express");
const dotenv = require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.get("/api", (req, res) => {
  res.status(200).json({ message: "Hello, world" });
});

app.listen(PORT, () => {
  console.log("App is running");
});
