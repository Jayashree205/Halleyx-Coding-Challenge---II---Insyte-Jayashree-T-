const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/order_insight_dashboard';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboards');
const widgetRoutes = require('./routes/widgets');
const userRoutes = require('./routes/users');

app.use('/api/orders', orderRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/users', userRoutes);

// For local development: serve React build
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const path = require('path');
  const PORT = process.env.PORT || 5000;
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*all', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
