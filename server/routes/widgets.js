const express = require('express');
const router = express.Router();
const Widget = require('../models/Widget');

// Get all widgets
router.get('/', async (req, res) => {
  try {
    const widgets = await Widget.find();
    res.json(widgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a widget
router.post('/', async (req, res) => {
  const widget = new Widget(req.body);
  try {
    const newWidget = await widget.save();
    res.status(201).json(newWidget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;