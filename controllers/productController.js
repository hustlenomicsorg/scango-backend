const db = require("../db");
const promiseDb = db.promise();

async function getProducts(req, res) {
  try {
    const [rows] = await promiseDb.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

async function getProductByBarcode(req, res) {
  const { barcode } = req.params;
  try {
    const [rows] = await promiseDb.query("SELECT * FROM products WHERE barcode = ?", [barcode]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

async function createProduct(req, res) {
  const { name, barcode, price, stock } = req.body || {};

  if (!name || !barcode || price == null || stock == null) {
    return res.status(400).json({ error: "Missing required fields: name, barcode, price, stock" });
  }

  try {
    const [result] = await promiseDb.query(
      "INSERT INTO products (name, barcode, price, stock) VALUES (?, ?, ?, ?)",
      [name, barcode, price, stock]
    );

    const [rows] = await promiseDb.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Product with this barcode already exists" });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
}

module.exports = {
  getProducts,
  getProductByBarcode,
  createProduct
};
