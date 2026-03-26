const express = require('express');
const { body } = require('express-validator');
const { createSale, getSales, getSale } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const saleRules = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'online']).withMessage('Invalid payment method'),
];

router.use(protect);
router.route('/').get(getSales).post(saleRules, createSale);
router.route('/:id').get(getSale);

module.exports = router;