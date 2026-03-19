const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  type: String, // 'kpi', 'bar', 'pie', 'table'
  config: Object, // Configuration object
  dashboardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dashboard' },
});

module.exports = mongoose.model('Widget', widgetSchema);