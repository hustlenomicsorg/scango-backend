const db = require("../db");
const promiseDb = db.promise();

async function createOrder(req, res) {
  const { items } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing required fields: items (non-empty array)" });
  }

  try {
    await promiseDb.beginTransaction();

    let total = 0;
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        throw new Error("Invalid item in items array");
      }

      const [productRows] = await promiseDb.query(
        "SELECT price, stock FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product not found: ${item.product_id}`);
      }

      const product = productRows[0];

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${item.product_id}`);
      }

      total += Number(product.price) * item.quantity;

      await promiseDb.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    const [orderResult] = await promiseDb.query(
      "INSERT INTO orders (total) VALUES (?)",
      [total.toFixed(2)]
    );

    const orderId = orderResult.insertId;

    // We need to fetch the exact item prices again to store them safely
    const orderItemsValues = [];
    for (const item of items) {
      const [pRows] = await promiseDb.query("SELECT price FROM products WHERE id = ?", [item.product_id]);
      orderItemsValues.push([orderId, item.product_id, item.quantity, pRows[0].price]);
    }

    await promiseDb.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
      [orderItemsValues]
    );

    await promiseDb.commit();

    res.status(201).json({
      id: orderId,
      total: total.toFixed(2),
      items
    });
  } catch (err) {
    console.error(err);
    await promiseDb.rollback();

    if (err.message && err.message.startsWith("Product not found")) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message && err.message.startsWith("Insufficient stock")) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === "Invalid item in items array") {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: "Failed to create order" });
  }
}

async function getOrders(req, res) {
  try {
    const [orders] = await promiseDb.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

async function getOrder(req, res) {
  const { id } = req.params;
  try {
    const [orders] = await promiseDb.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const [items] = await promiseDb.query("SELECT * FROM order_items WHERE order_id = ?", [id]);
    const order = orders[0];
    order.items = items;
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrder
};
