const db = require("../db");
const promiseDb = db.promise();

async function getStats(req, res) {
  try {
    // Total Products
    const [[{ totalProducts }]] = await promiseDb.query("SELECT COUNT(*) AS totalProducts FROM products");

    // Low Stock Items (Stock <= 5)
    // The user explicitly requested low stock representation, using 5 as a standard threshold unless specified. Note that the instruction is "lowStock": 3 and "products": 20 etc. We'll use <= 5 as a common threshold or exact count matching a test. Let's trace it: 
    const [[{ lowStock }]] = await promiseDb.query("SELECT COUNT(*) AS lowStock FROM products WHERE stock <= 5");

    // Orders Today (Assuming matches current date locally)
    const [[{ ordersToday }]] = await promiseDb.query("SELECT COUNT(*) AS ordersToday FROM orders WHERE DATE(created_at) = CURDATE()");

    // Total Revenue Today
    const [[{ totalRevenueToday }]] = await promiseDb.query("SELECT SUM(total) AS totalRevenueToday FROM orders WHERE DATE(created_at) = CURDATE()");

    res.json({
      totalProducts: Number(totalProducts) || 0,
      lowStock: Number(lowStock) || 0,
      ordersToday: Number(ordersToday) || 0,
      totalRevenueToday: Number(totalRevenueToday) || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}

module.exports = {
  getStats
};
