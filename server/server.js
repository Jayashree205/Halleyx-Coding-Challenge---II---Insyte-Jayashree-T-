// Suppress DEP0060 warning
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  if (typeof warning === 'string' && warning.includes('DEP0060')) return;
  if (warning instanceof Error && warning.code === 'DEP0060') return;
  return originalEmitWarning(warning, ...args);
};

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/order_insight_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboards');
const widgetRoutes = require('./routes/widgets');
const userRoutes = require('./routes/users');

app.use('/api/orders', orderRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const path = require('path');

// Serve React build folder
app.use(express.static(path.join(__dirname, '../client/build')));

// Return index.html for all other routes (React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});