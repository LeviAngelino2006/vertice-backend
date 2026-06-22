const { z } = require('zod');
const prisma = require('../config/db');

const querySchema = z.object({
  categoria: z.string().optional(),
  destacado: z.enum(['true', 'false']).optional(),
  nuevo: z.enum(['true', 'false']).optional(),
});

function serializeProduct(product) {
  return {
    ...product,
    precio: Number(product.precio),
    precioAnterior: product.precioAnterior != null ? Number(product.precioAnterior) : null,
  };
}

async function getProducts(req, res, next) {
  try {
    const query = querySchema.parse(req.query);

    const where = {};
    if (query.categoria) where.categoria = query.categoria;
    if (query.destacado !== undefined) where.destacado = query.destacado === 'true';
    if (query.nuevo !== undefined) where.nuevo = query.nuevo === 'true';

    const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'asc' } });
    res.json(products.map(serializeProduct));
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(serializeProduct(product));
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getProductById };
