require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const productsRouter = require('./routes/products.routes');
const healthRouter = require('./routes/health.routes');
const authRouter = require('./routes/auth.routes');
const ordersRouter = require('./routes/orders.routes');
const adminProductsRouter = require('./routes/admin.products.routes');
const adminOrdersRouter = require('./routes/admin.orders.routes');
const requireAuth = require('./middlewares/auth');
const requireAdmin = require('./middlewares/requireAdmin');
const { getDashboard } = require('./controllers/admin.orders.controller');

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.get('/api/admin/dashboard', requireAuth, requireAdmin, getDashboard);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`VÉRTICE backend corriendo en http://localhost:${PORT}`);
});
