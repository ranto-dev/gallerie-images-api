const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use("/api", require("./routes/base.routes"));

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
