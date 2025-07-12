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
    }).catch((err) => {
      console.error(err);
      res.status(404).json({
        message: "User not found",
        message: WARNING,
        details: err.message,
      });
    });
  } catch (err) {
    console.error("Server Error:", err);
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
        content: result.rows,
      });
    }).catch((err) => {
      console.error(err);
      res.status(404).json({
        message: "User list not found",
        message: WARNING,
        details: err.message,
      });
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      message_color: ERROR,
      details: err.message,
    });
  }
};

module.exports.getUserById = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res
      .status(404)
      .json({ message: "ID is not found", message_color: WARNING });
  }

  try {
    const RESULT = pool.query("SELECT * FROM USER_APP WHERE ID=$1", [id]);
    RESULT.then((result) => {
      res.status(200).json({
        message: `User at ID: ${id} is found`,
        message_color: SUCCESS,
        content: result.rows[0],
      });
    }).catch((err) => {
      console.error(err);
      res.status(404).json({
        message: "User not found",
        message: WARNING,
        details: err.message,
      });
    });
  } catch (err) {
    console.error("Server Error: " + err);
    res.status(500).json({
      message: "Internal Server Error",
      message_color: ERROR,
      details: err.message,
    });
  }
};

module.exports.updateUserById = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res
      .status(404)
      .json({ message: "ID not found", message_color: WARNING });
  }

  const keys = Object.keys(req.body);
  const values = Object.values(req.body);

  if (!keys || keys.length <= 0) {
    return res.status(404).json({
      message: "Data to updated is not found",
      message_color: WARNING,
    });
  }

  let request_body = "";

  for (let count = 0; count < keys.length; count++) {
    const key = keys[count];
    request_body += `${key.toUpperCase()}=$${count + 1},`;
  }

  request_body = request_body.trim();

  if (request_body.endsWith(",")) {
    request_body = request_body.slice(0, -1);
  }

  values.push(id);

  console.log(
    `Req: ${request_body}, ID: ${keys.length + 1}, values: ${values}`
  );

  try {
    const CHECK = pool.query("SELECT * FROM USER_APP WHERE ID=$1", [id]);

    CHECK.then((result) => {
      if (!result.rows[0] || result.rows[0].length <= 0) {
        return res.status(404).json({
          message: `User at ID: ${id} is not found`,
          message_color: WARNING,
        });
      }
    }).catch((err) => {
      res.status(400).json({
        message: `Bad request`,
        message_color: WARNING,
      });
    });
    const RESULT = pool.query(
      `UPDATE USER_APP SET ${request_body} WHERE ID=$${
        keys.length + 1
      } RETURNING *`,
      values
    );

    RESULT.then((result) => {
      res.status(200).json({
        message: "User is updated",
        message_color: SUCCESS,
        content: result.rows,
      });
    }).catch((err) => {
      console.error(err);
      res.status(404).json({
        message: "User not updated",
        message: WARNING,
        details: err.message,
      });
    });
  } catch (err) {
    console.error("Server Error: " + err);
    res.status(500).json({
      message: "Internal Server Error",
      message_color: ERROR,
      details: err.message,
    });
  }
};

module.exports.deleteUserById = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res
      .status(404)
      .json({ message: "ID is not found", message_color: WARNING });
  }

  try {
    const RESULT = pool.query("DELETE FROM USER_APP WHERE ID=$1 RETURNING *", [
      id,
    ]);

    RESULT.then((result) => {
      res.status(200).json({
        message: "User is deleted",
        message_color: SUCCESS,
        content: result.rows,
      });
    }).catch((err) => {
      console.error(err);
      res.status(400).json({
        message: `Bad resquest - User at ID: ${id} is not found`,
        message_color: WARNING,
      });
    });
  } catch (err) {
    console.error("Server Error: " + err);
    res.status(500).json({
      message: "Internal Server Error",
      message_color: ERROR,
      details: err.message,
    });
  }
};
