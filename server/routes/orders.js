const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const order = new Order({
    customer: req.body.customer,
    order: {
      ...req.body.order,
      totalAmount: req.body.order.items && req.body.order.items.length > 0
        ? req.body.order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        : (req.body.order.quantity * req.body.order.unitPrice) || 0,
    },
  });
  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an order
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
      customer: req.body.customer,
      order: {
        ...req.body.order,
        totalAmount: req.body.order.items && req.body.order.items.length > 0
          ? req.body.order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
          : (req.body.order.quantity * req.body.order.unitPrice) || 0,
      },
    }, { new: true });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;