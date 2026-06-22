# VÉRTICE — Backend

API REST para la plataforma VÉRTICE. Node.js 22 + Express 5 + PostgreSQL 16 + Prisma ORM.

## Requisitos

- Node.js 22 LTS
- PostgreSQL 16+ corriendo localmente

## Levantar en local

**1. Instalar dependencias**
```bash
npm install
```

**2. Configurar variables de entorno**

Copiá `.env.example` a `.env` y completá los valores:
```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL |
| `PORT` | Puerto del servidor (default: 4000) |
| `FRONTEND_URL` | Origen permitido por CORS |

**3. Crear la base de datos y correr migraciones**
```bash
npx prisma migrate dev --name init
```

**4. Poblar el catálogo**
```bash
npm run seed
```

**5. Iniciar el servidor**
```bash
npm run dev   # con hot-reload (node --watch)
npm start     # producción
```

El servidor queda disponible en `http://localhost:4000`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Healthcheck |
| GET | `/api/products` | Lista todos los productos |
| GET | `/api/products/:id` | Un producto por id |

### Query params opcionales para `/api/products`

- `?categoria=Remeras` — filtra por categoría
- `?destacado=true` — solo productos destacados
- `?nuevo=true` — solo productos nuevos

Se pueden combinar: `?categoria=Buzos&destacado=true`
