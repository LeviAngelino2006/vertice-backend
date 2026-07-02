const { Router } = require('express');
const requireAuth = require('../middlewares/auth');
const { getCart, upsertCartItem, deleteCartItem, clearCart } = require('../controllers/cart.controller');

const router = Router();

router.use(requireAuth);

router.get('/', getCart);
router.put('/', upsertCartItem);
router.delete('/:itemId', deleteCartItem);
router.delete('/', clearCart);

module.exports = router;
