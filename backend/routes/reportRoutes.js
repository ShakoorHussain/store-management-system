const express = require('express');
const { getDailyReport, getMonthlyReport, getDashboardSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/summary', getDashboardSummary);
router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;
