const Sale = require('../models/Sale');
const Product = require('../models/Product');

const getDailyReport = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const start = new Date(dateStr); start.setHours(0, 0, 0, 0);
    const end = new Date(dateStr); end.setHours(23, 59, 59, 999);
    const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } }).populate('createdBy', 'name');
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.quantity, 0), 0);
    const paymentBreakdown = sales.reduce((acc, s) => { acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.totalAmount; return acc; }, {});
    const productMap = {};
    sales.forEach((sale) => { sale.items.forEach((item) => { const key = item.productName; if (!productMap[key]) productMap[key] = { name: key, quantity: 0, revenue: 0 }; productMap[key].quantity += item.quantity; productMap[key].revenue += item.subtotal; }); });
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    res.json({ success: true, data: { date: dateStr, totalSales: sales.length, totalRevenue, totalItems, paymentBreakdown, topProducts, sales } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } });
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const dailyBreakdown = await Sale.aggregate([{ $match: { createdAt: { $gte: start, $lte: end } } }, { $group: { _id: { $dayOfMonth: '$createdAt' }, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const productMap = {};
    sales.forEach((sale) => { sale.items.forEach((item) => { const key = item.productName; if (!productMap[key]) productMap[key] = { name: key, quantity: 0, revenue: 0 }; productMap[key].quantity += item.quantity; productMap[key].revenue += item.subtotal; }); });
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const lowStock = await Product.find({ quantity: { $lte: 10 }, isActive: true }).select('name quantity category');
    res.json({ success: true, data: { year, month, totalSales: sales.length, totalRevenue, dailyBreakdown, topProducts, lowStock } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [totalProducts, todaySales, monthlySales, lowStockProducts] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Sale.aggregate([{ $match: { createdAt: { $gte: today } } }, { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Sale.aggregate([{ $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }, { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Product.countDocuments({ quantity: { $lte: 10 }, isActive: true }),
    ]);
    res.json({ success: true, data: { totalProducts, todayRevenue: todaySales[0]?.revenue || 0, todaySalesCount: todaySales[0]?.count || 0, monthRevenue: monthlySales[0]?.revenue || 0, monthlySalesCount: monthlySales[0]?.count || 0, lowStockProducts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDailyReport, getMonthlyReport, getDashboardSummary };