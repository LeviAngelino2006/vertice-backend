const { z } = require('zod');
const prisma = require('../config/db');

const upsertSchema = z.object({
  productId: z.string().min(1),
  talle: z.string().min(1),
  color: z.string().min(1),
  cantidad: z.number().int(),
});

function serializeProductSummary(product) {
  if (!product) return null;
  return {
    id: product.id,
    nombre: product.nombre,
    precio: Number(product.precio),
    imagenes: product.imagenes,
  };
}

async function serializeCartItems(items) {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    talle: item.talle,
    color: item.color,
    cantidad: item.cantidad,
    product: serializeProductSummary(productMap.get(item.productId)),
  }));
}

async function getCurrentCart(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return serializeCartItems(items);
}

async function getCart(req, res, next) {
  try {
    res.json(await getCurrentCart(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function upsertCartItem(req, res, next) {
  try {
    const { productId, talle, color, cantidad } = upsertSchema.parse(req.body);

    if (cantidad <= 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: req.user.id, productId, talle, color },
      });
    } else {
      await prisma.cartItem.upsert({
        where: {
          userId_productId_talle_color: { userId: req.user.id, productId, talle, color },
        },
        update: { cantidad },
        create: { userId: req.user.id, productId, talle, color, cantidad },
      });
    }

    res.json(await getCurrentCart(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function deleteCartItem(req, res, next) {
  try {
    const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });

    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    await prisma.cartItem.delete({ where: { id: item.id } });

    res.json(await getCurrentCart(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json([]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, upsertCartItem, deleteCartItem, clearCart };
