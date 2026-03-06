const db = require("../db");
const promiseDb = db.promise();

async function getStats(req, res) {
  try {
    const [[{ totalProducts }]] = await promiseDb.query("SELECT COUNT(*) AS totalProducts FROM products");
    const [[{ lowStock }]] = await promiseDb.query("SELECT COUNT(*) AS lowStock FROM products WHERE stock <= 5");
    const [[{ ordersToday }]] = await promiseDb.query("SELECT COUNT(*) AS ordersToday FROM orders WHERE DATE(created_at) = CURDATE()");
    const [[{ totalRevenue }]] = await promiseDb.query("SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders WHERE DATE(created_at) = CURDATE()");

    res.json({
      success: true,
      data: {
        totalProducts: Number(totalProducts) || 0,
        ordersToday: Number(ordersToday) || 0,
        lowStock: Number(lowStock) || 0,
        totalRevenue: Number(totalRevenue) || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
}

module.exports = {
  getStats
};
