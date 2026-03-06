require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const createTables = () => {
  const productsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      barcode VARCHAR(100) UNIQUE,
      price DECIMAL(10,2),
      stock INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  const ordersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      total DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  const orderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      product_id INT,
      qty INT,
      price DECIMAL(10,2)
    )`;

  db.query(productsTable, (err) => {
    if (err) console.error("Error creating products table:", err);
  });
  db.query(ordersTable, (err) => {
    if (err) console.error("Error creating orders table:", err);
  });
  db.query(orderItemsTable, (err) => {
    if (err) console.error("Error creating order_items table:", err);
  });
  
  // Migration hot-patches
  db.query("ALTER TABLE products ADD INDEX barcode_index (barcode)", (err) => {
    // Ignore duplicate key name errors if it already exists
    if (err && err.code !== 'ER_DUP_KEYNAME') console.error("Error creating barcode_index:", err);
  });
  db.query("ALTER TABLE order_items CHANGE quantity qty INT", (err) => {
    // Ignore column not found errors if it was already migrated
    if (err && err.code !== 'ER_BAD_FIELD_ERROR') console.error("Error changing quantity to qty:", err);
  });
};

createTables();

app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", statsRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ScanGo backend running" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
