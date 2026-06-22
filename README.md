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
| `JWT_SECRET` | String random de al menos 32 bytes (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `JWT_EXPIRES_IN` | Expiración del token (ej. `7d`) |
| `GOOGLE_CLIENT_ID` | Client ID de Google Cloud Console (opcional hasta la Fase 2 frontend) |

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

### Salud

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Healthcheck |

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Lista todos los productos |
| GET | `/api/products/:id` | Un producto por id |

Query params opcionales para `/api/products`: `?categoria=Remeras`, `?destacado=true`, `?nuevo=true` (combinables).

### Auth

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | Registrar usuario con email y contraseña |
| POST | `/api/auth/login` | — | Login con email y contraseña |
| POST | `/api/auth/google` | — | Login/registro con Google ID token |
| GET | `/api/auth/me` | Bearer token | Datos del usuario logueado |

## Ejemplos de uso (curl)

**Registrar usuario**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"yo@ejemplo.com","password":"mipassword123","nombre":"Mi Nombre"}'
```

**Login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yo@ejemplo.com","password":"mipassword123"}'
```

**Datos del usuario (reemplazá `<TOKEN>` con el token recibido)**
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

**Filtrar productos**
```bash
curl "http://localhost:4000/api/products?categoria=Remeras&destacado=true"
```
