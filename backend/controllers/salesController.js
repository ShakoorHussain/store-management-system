const { validationResult } = require('express-validator');
const Sale    = require('../models/Sale');
const Product = require('../models/Product');

const generateInvoice = async () => {
  const count = await Sale.countDocuments();
  const date  = new Date();
  const year  = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

const createSale = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { items, paymentMethod, customerName, notes } = req.body;
    const saleItems = [];
    let totalAmount = 0;

    // Step 1 — validate all stock first
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }
    }

    // Step 2 — deduct stock and build items
    for (const item of items) {
      const product = await Product.findById(item.productId);
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      saleItems.push({
        product:     product._id,
        productName: product.name,
        quantity:    item.quantity,
        unitPrice:   product.price,
        subtotal,
      });

      product.quantity -= item.quantity;
      await product.save();
    }

    // Step 3 — create sale with invoice
    const invoiceNumber = await generateInvoice();

    const sale = await Sale.create({
      invoiceNumber,
      items: saleItems,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      customerName:  customerName  || 'Walk-in Customer',
      notes,
      createdBy: req.user._id,
    });

    const populated = await Sale.findById(sale._id).populate('createdBy', 'name');
    res.status(201).json({ success: true, message: 'Sale created successfully', data: populated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate)   query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query).populate('createdBy', 'name').sort('-createdAt').skip(skip).limit(Number(limit));
    res.json({ success: true, count: sales.length, total, pages: Math.ceil(total / limit), data: sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('createdBy', 'name');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createSale, getSales, getSale };