const pool = require("../config/database.connection");
const { WARNING, ERROR, SUCCESS } = require("../utils/message.color");

module.exports.createUser = (req, res) => {
  const { username, password, description, address, city, contact, email } =
    req.body;

  if (
    !username ||
    !password ||
    !description ||
    !address ||
    !city ||
    !contact ||
    !email
  ) {
    return res.status(400).json({
      message: "Bad request - Check tha data or parameter sent",
      message_color: WARNING,
    });
  }

  if (username < 30) {
    return res.status(400).json({
      message: "Bad request - Your username is not valide",
      message_color: WARNING,
      directive: "Choose a other username no lengthy",
    });
  }

  if (password < 6) {
    return res.status(400).json({
      message: "Bad request - Your password is not valide",
      message_color: WARNING,
      directive: "Your password must upper than 6 character",
    });
  }

  if (contact.length > 13) {
    return res.status(400).json({
      message: "Bad request - your contact is not valide",
      message_color: WARNING,
    });
  }

  try {
    const RESULT = pool.query(
      "INSERT INTO USER_APP(USERNAME, PASSWORD, DESCRIPTION, ADDRESS, CITY, CONTACT, EMAIL) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [username, password, description, address, city, contact, email]
    );
    RESULT.then((result) => {
      return res.status(200).json({
        message: "Request completed successfully - User is created",
        message_color: SUCCESS,
        content: result.rows[0],
      });
    });
    res.end();
  } catch (err) {
    console.error("Erreur DB:", err);
    res.status(500).json({
      message: "Internal Server Error",
      message_color: ERROR,
      details: err.message,
    });
  }
};

module.exports.getAllUser = (req, res) => {
  try {
    const RESULT = pool.query("SELECT * FROM USER_APP ORDER BY ID");
    RESULT.then((result) => {
      res.status(200).json({
        message: "All users is found",
        message_color: SUCCESS,
        content: result.rows[0],
      });
    }).catch((err) => {
      res.status(404).json({
        message: "User not found",
        message_color: WARNING,
      });
    });
  } catch (err) {
    console.error("Erreur DB:", err);
    res.status(500).json({
      message: "Internal Server Error",
      message_color: ERROR,
      details: err.message,
    });
  }
};
