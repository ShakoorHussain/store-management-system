const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true },
  subtotal:    { type: Number, required: true },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    items: {
      type: [saleItemSchema],
      validate: [(arr) => arr.length > 0, 'Sale must have at least one item'],
    },
    totalAmount:   { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
    customerName:  { type: String, trim: true, default: 'Walk-in Customer' },
    notes:         { type: String, trim: true },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);