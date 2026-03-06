require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

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
      payment_status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  const orderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      product_id INT,
      quantity INT
    )`;

  const adminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100),
      password VARCHAR(255)
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
  db.query(adminsTable, (err) => {
    if (err) console.error("Error creating admins table:", err);
  });
};

createTables();

app.use(productRoutes);
app.use(orderRoutes);
app.use(adminRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ScanGo backend running" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
