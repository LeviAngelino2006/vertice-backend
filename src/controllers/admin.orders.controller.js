const { z } = require('zod');
const prisma = require('../config/db');

const updateEstadoSchema = z.object({
  estado: z.enum(['PAGADA', 'ENVIADA', 'ENTREGADA', 'CANCELADA']),
});

async function getAllOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        numeroOrden: true,
        createdAt: true,
        nombreEnvio: true,
        emailInvitado: true,
        total: true,
        estado: true,
        user: { select: { email: true } },
      },
    });

    res.json(
      orders.map((o) => ({
        id: o.id,
        numeroOrden: o.numeroOrden,
        createdAt: o.createdAt,
        nombreEnvio: o.nombreEnvio,
        email: o.user?.email ?? o.emailInvitado,
        total: Number(o.total),
        estado: o.estado,
      })),
    );
  } catch (err) {
    next(err);
  }
}

async function updateOrderEstado(req, res, next) {
  try {
    const { estado } = updateEstadoSchema.parse(req.body);

    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { estado },
    });

    res.json({
      ...order,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
    });
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const [allOrders, productosBajoStock] = await Promise.all([
      prisma.order.findMany({ select: { total: true, estado: true } }),
      prisma.product.findMany({
        where: { stock: { lte: 3 } },
        select: { id: true, nombre: true, stock: true },
        orderBy: { stock: 'asc' },
      }),
    ]);

    const ventasTotales = allOrders
      .filter((o) => o.estado !== 'CANCELADA')
      .reduce((sum, o) => sum + Number(o.total), 0);

    const pedidosPorEstado = { PAGADA: 0, ENVIADA: 0, ENTREGADA: 0, CANCELADA: 0 };
    for (const o of allOrders) {
      if (o.estado in pedidosPorEstado) {
        pedidosPorEstado[o.estado]++;
      }
    }

    res.json({
      ventasTotales,
      cantidadPedidos: allOrders.length,
      pedidosPorEstado,
      productosBajoStock,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllOrders, updateOrderEstado, getDashboard };
