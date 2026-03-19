const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email, password });
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password }); // In prod: bcrypt.compare
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { email, ...updateData } = req.body;
    console.log(`Updating profile for email: ${email}`);
    
    // Explicitly using upsert: true and new: true
    const user = await User.findOneAndUpdate(
      { email }, 
      updateData, 
      { new: true, upsert: true, runValidators: true }
    );
    
    console.log(`Profile successfully ${user.wasNew ? 'created' : 'updated'} for: ${user.email}`);
    res.json(user);
  } catch (err) {
    console.error(`Profile update error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// GET all users (usernames only for dropdowns)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;