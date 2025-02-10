// ordering-management-backend/routes/order.routes.js
const express = require('express');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/order.controller');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Create a new order
router.post('/', authenticate, createOrder);

// Get all orders (Admin) or own orders (User)
router.get('/', authenticate, getOrders);

// Update order status (Admin only)
router.patch('/:id', authenticate, isAdmin, updateOrderStatus);

module.exports = router;
