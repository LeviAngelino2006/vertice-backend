-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('PAGADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "numeroOrden" TEXT NOT NULL,
    "userId" TEXT,
    "emailInvitado" TEXT,
    "nombreEnvio" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'PAGADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "talle" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_numeroOrden_key" ON "Order"("numeroOrden");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
