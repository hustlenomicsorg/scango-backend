const db = require("../db");
const promiseDb = db.promise();

async function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const [rows] = await promiseDb.query(
      "SELECT * FROM admins WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to login" });
  }
}

module.exports = {
  login
};
