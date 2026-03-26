const express = require('express');
const { body } = require('express-validator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

router.use(protect);

router.get('/categories', getCategories);
router.route('/').get(getProducts).post(authorize('admin'), productRules, createProduct);
router.route('/:id').get(getProduct).put(authorize('admin'), productRules, updateProduct).delete(authorize('admin'), deleteProduct);

module.exports = router;