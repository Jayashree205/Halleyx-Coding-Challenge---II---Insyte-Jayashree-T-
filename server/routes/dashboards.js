const express = require('express');
const router = express.Router();
const Dashboard = require('../models/Dashboard');
const Order = require('../models/Order');

// Get all dashboards for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const dashboards = await Dashboard.find(filter);
    res.json(dashboards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get aggregated data for widgets
router.get('/data', async (req, res) => {
  const { filter, customerEmail, orderIds } = req.query;
  let query = {};

  if (filter) {
    const now = new Date();
    switch (filter) {
      case 'today':
        query.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
        break;
      case 'last7days':
        query.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'last30days':
        query.createdAt = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'last90days':
        query.createdAt = { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) };
        break;
      default:
        break;
    }
  }

  if (orderIds) {
    const ids = orderIds.split(',').map(i => i.trim()).filter(Boolean);
    if (ids.length > 0) {
      query._id = { $in: ids };
    }
  } else if (customerEmail) {
    const emails = customerEmail.split(',').map(e => e.trim()).filter(Boolean);
    if (emails.length === 1) {
      query['customer.email'] = emails[0];
    } else if (emails.length > 1) {
      query['customer.email'] = { $in: emails };
    }
  }

  try {
    const orders = await Order.find(query);
    // Aggregate data as needed for charts/KPIs
    const totalRevenue = orders.reduce((sum, order) => sum + order.order.totalAmount, 0);
    const productCounts = orders.reduce((acc, order) => {
      acc[order.order.product] = (acc[order.order.product] || 0) + order.order.quantity;
      return acc;
    }, {});
    res.json({ totalRevenue, productCounts, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific dashboard
router.get('/:id', async (req, res) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id);
    if (!dashboard) return res.status(404).json({ message: 'Dashboard not found' });
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update a dashboard
router.post('/', async (req, res) => {
  try {
    const { id, name, layout, userId, customerFilter, orderIds } = req.body;
    let dashboard;
    
    if (id && id !== 'new') {
      dashboard = await Dashboard.findByIdAndUpdate(
        id,
        { name, layout, customerFilter, orderIds },
        { new: true }
      );
    } else {
      dashboard = new Dashboard({ name, layout, userId, customerFilter, orderIds });
      await dashboard.save();
    }
    res.status(200).json(dashboard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a dashboard
router.delete('/:id', async (req, res) => {
  try {
    await Dashboard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dashboard deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get aggregated data for widgets
router.get('/data', async (req, res) => {
  const { filter, customerEmail, orderIds } = req.query;
  let query = {};

  if (filter) {
    const now = new Date();
    switch (filter) {
      case 'today':
        query.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
        break;
      case 'last7days':
        query.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'last30days':
        query.createdAt = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'last90days':
        query.createdAt = { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) };
        break;
      default:
        break;
    }
  }

  if (orderIds) {
    const ids = orderIds.split(',').map(i => i.trim()).filter(Boolean);
    if (ids.length > 0) {
      query._id = { $in: ids };
    }
  } else if (customerEmail) {
    const emails = customerEmail.split(',').map(e => e.trim()).filter(Boolean);
    if (emails.length === 1) {
      query['customer.email'] = emails[0];
    } else if (emails.length > 1) {
      query['customer.email'] = { $in: emails };
    }
  }

  try {
    const orders = await Order.find(query);
    // Aggregate data as needed for charts/KPIs
    const totalRevenue = orders.reduce((sum, order) => sum + order.order.totalAmount, 0);
    const productCounts = orders.reduce((acc, order) => {
      acc[order.order.product] = (acc[order.order.product] || 0) + order.order.quantity;
      return acc;
    }, {});
    res.json({ totalRevenue, productCounts, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;