const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/order_insight_dashboard';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API Routes - Pointing to the /server directory
app.use('/api/orders', require('../server/routes/orders'));
app.use('/api/dashboards', require('../server/routes/dashboards'));
app.use('/api/widgets', require('../server/routes/widgets'));
app.use('/api/users', require('../server/routes/users'));

// Note: Static serving of React is handled by vercel.json rewrites

module.exports = app;
