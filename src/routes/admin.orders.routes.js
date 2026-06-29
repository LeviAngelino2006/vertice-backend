const { Router } = require('express');
const requireAuth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const { getAllOrders, updateOrderEstado, getDashboard } = require('../controllers/admin.orders.controller');

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', getAllOrders);
router.put('/:id/estado', updateOrderEstado);

module.exports = router;
