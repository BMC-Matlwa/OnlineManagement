// ordering-management-backend/controllers/order.controller.js
const { Order, OrderItem, Product } = require('../models');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ productId, quantity }]
    const order = await Order.create({ userId: req.user.id, status: 'pending' });

    const orderItems = items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity
    }));
    await OrderItem.bulkCreate(orderItems);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get all orders (Admin) or user's own orders
exports.getOrders = async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const orders = await Order.findAll({
      where: whereClause,
      include: [{ model: OrderItem, include: [Product] }]
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};