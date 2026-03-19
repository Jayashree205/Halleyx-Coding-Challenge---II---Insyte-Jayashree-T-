const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  order: {
    items: [{
      product: String,
      quantity: Number,
      unitPrice: Number,
      totalAmount: Number,
      batches: Number,
    }],
    product: String,
    quantity: Number,
    unitPrice: Number,
    totalAmount: Number,
    status: String,
    createdBy: String,
    currency: { type: String, default: 'USD' },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);