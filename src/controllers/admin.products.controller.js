const { z } = require('zod');
const prisma = require('../config/db');

const productSchema = z.object({
  nombre: z.string().min(1),
  categoria: z.string().min(1),
  precio: z.number().positive(),
  precioAnterior: z.number().positive().nullable().optional(),
  colores: z.array(z.string().min(1)).min(1),
  talles: z.array(z.string().min(1)).min(1),
  imagenes: z.array(z.string().url()).min(1),
  descripcion: z.string().min(1),
  destacado: z.boolean().optional().default(false),
  nuevo: z.boolean().optional().default(false),
  stock: z.number().int().nonnegative().optional().default(10),
});

const productUpdateSchema = productSchema.partial();

function serializeProduct(product) {
  return {
    ...product,
    precio: Number(product.precio),
    precioAnterior: product.precioAnterior != null ? Number(product.precioAnterior) : null,
  };
}

async function createProduct(req, res, next) {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json(serializeProduct(product));
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const data = productUpdateSchema.parse(req.body);

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });
    res.json(serializeProduct(product));
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { createProduct, updateProduct, deleteProduct };
