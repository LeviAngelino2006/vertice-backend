-- Add enum values if they don't already exist
ALTER TYPE "EstadoOrden" ADD VALUE IF NOT EXISTS 'ENVIADA';
ALTER TYPE "EstadoOrden" ADD VALUE IF NOT EXISTS 'ENTREGADA';

-- Add updatedAt column to Order if it doesn't already exist
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now();
