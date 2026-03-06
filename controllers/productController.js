const db = require("../db");
const promiseDb = db.promise();

async function getProducts(req, res) {
  try {
    const [rows] = await promiseDb.query("SELECT * FROM products");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
}

async function getProductByBarcode(req, res) {
  const { barcode } = req.params;
  try {
    const [rows] = await promiseDb.query("SELECT * FROM products WHERE barcode = ?", [barcode]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
}

async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await promiseDb.query("SELECT * FROM products WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
}

async function createProduct(req, res) {
  const { name, barcode, price, stock } = req.body || {};

  if (!name || !barcode || price == null || stock == null) {
    return res.status(400).json({ success: false, message: "Missing required fields: name, barcode, price, stock" });
  }

  try {
    const [result] = await promiseDb.query(
      "INSERT INTO products (name, barcode, price, stock) VALUES (?, ?, ?, ?)",
      [name, barcode, price, stock]
    );

    const [rows] = await promiseDb.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Product with this barcode already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, barcode, price, stock } = req.body || {};

  if (!name || !barcode || price == null || stock == null) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const [result] = await promiseDb.query(
      "UPDATE products SET name=?, barcode=?, price=?, stock=? WHERE id=?",
      [name, barcode, price, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: { id: Number(id), name, barcode, price, stock } });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Barcode already in use by another product" });
    }
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const [result] = await promiseDb.query("DELETE FROM products WHERE id=?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
}

module.exports = {
  getProducts,
  getProductByBarcode,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
