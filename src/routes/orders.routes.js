const { Router } = require('express');
const requireAuth = require('../middlewares/auth');
const { createOrder, getOrderById, getMyOrders } = require('../controllers/orders.controller');

const router = Router();

router.post('/', createOrder);
router.get('/me', requireAuth, getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
