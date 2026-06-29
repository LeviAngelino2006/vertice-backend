const { Router } = require('express');
const requireAuth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const { createProduct, updateProduct, deleteProduct } = require('../controllers/admin.products.controller');

const router = Router();

router.use(requireAuth, requireAdmin);

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
