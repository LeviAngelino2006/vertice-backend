require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const productsRouter = require('./routes/products.routes');
const healthRouter = require('./routes/health.routes');
const authRouter = require('./routes/auth.routes');
const ordersRouter = require('./routes/orders.routes');

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`VÉRTICE backend corriendo en http://localhost:${PORT}`);
});
