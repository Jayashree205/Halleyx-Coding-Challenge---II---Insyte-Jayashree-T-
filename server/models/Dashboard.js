const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  name: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  layout: Array, // Array of widget configurations
  customerFilter: String, // legacy support for filtering by email
  orderIds: [String], // order IDs used to power widgets based on selected orders
}, { timestamps: true });

module.exports = mongoose.model('Dashboard', dashboardSchema);