const { PrismaClient } = require('@prisma/client');
const productsData = require('./products-seed-data.json');

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando productos existentes...');
  await prisma.product.deleteMany();

  console.log(`Insertando ${productsData.length} productos...`);
  await prisma.product.createMany({
    data: productsData.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      precioAnterior: p.precioAnterior ?? null,
      colores: p.colores,
      talles: p.talles,
      imagenes: p.imagenes,
      descripcion: p.descripcion,
      destacado: p.destacado ?? false,
      nuevo: p.nuevo ?? false,
      stock: p.stock ?? 10,
    })),
  });

  console.log('Seed completado.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
