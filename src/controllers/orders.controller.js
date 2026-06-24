const { z } = require('zod');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const itemSchema = z.object({
  productId: z.string().min(1),
  talle: z.string().min(1),
  color: z.string().min(1),
  cantidad: z.number().int().positive(),
});

const envioSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  direccion: z.string().min(1),
  ciudad: z.string().min(1),
  codigoPostal: z.string().min(1),
  provincia: z.string().min(1),
  telefono: z.string().min(1),
});

const createOrderSchema = z.object({
  items: z.array(itemSchema).min(1),
  envio: envioSchema,
});

function generateNumeroOrden() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'VRT-';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function extractOptionalUser(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}

function serializeOrder(order) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      precioUnitario: Number(item.precioUnitario),
    })),
  };
}

async function createOrder(req, res, next) {
  try {
    const { items, envio } = createOrderSchema.parse(req.body);

    const authUser = await extractOptionalUser(req);

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Sum quantities per productId to validate stock correctly
    const quantityByProduct = new Map();
    for (const item of items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) || 0) + item.cantidad,
      );
    }

    const stockErrors = [];
    for (const [productId, totalCantidad] of quantityByProduct) {
      const product = productMap.get(productId);
      if (!product) {
        stockErrors.push({ productId, error: 'Producto no encontrado' });
        continue;
      }
      if (product.stock < totalCantidad) {
        stockErrors.push({
          productId,
          nombre: product.nombre,
          stockDisponible: product.stock,
          cantidadSolicitada: totalCantidad,
        });
      }
    }

    if (stockErrors.length > 0) {
      return res.status(409).json({ error: 'Stock insuficiente', detalle: stockErrors });
    }

    const subtotal = items.reduce((acc, item) => {
      return acc + Number(productMap.get(item.productId).precio) * item.cantidad;
    }, 0);
    const total = subtotal;

    // Generate unique numeroOrden
    let numeroOrden;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateNumeroOrden();
      const existing = await prisma.order.findUnique({ where: { numeroOrden: candidate } });
      if (!existing) {
        numeroOrden = candidate;
        break;
      }
    }
    if (!numeroOrden) {
      throw new Error('No se pudo generar un número de orden único');
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          numeroOrden,
          userId: authUser ? authUser.id : null,
          emailInvitado: authUser ? null : envio.email,
          nombreEnvio: envio.nombre,
          direccion: envio.direccion,
          ciudad: envio.ciudad,
          codigoPostal: envio.codigoPostal,
          provincia: envio.provincia,
          telefono: envio.telefono,
          subtotal,
          total,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId);
              return {
                productId: item.productId,
                nombreProducto: product.nombre,
                talle: item.talle,
                color: item.color,
                cantidad: item.cantidad,
                precioUnitario: Number(product.precio),
              };
            }),
          },
        },
        include: { items: true },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      return newOrder;
    });

    res.status(201).json({
      id: order.id,
      numeroOrden: order.numeroOrden,
      total: Number(order.total),
      items: order.items.map((i) => ({
        ...i,
        precioUnitario: Number(i.precioUnitario),
      })),
      createdAt: order.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        numeroOrden: true,
        total: true,
        estado: true,
        createdAt: true,
      },
    });

    res.json(orders.map((o) => ({ ...o, total: Number(o.total) })));
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getOrderById, getMyOrders };
