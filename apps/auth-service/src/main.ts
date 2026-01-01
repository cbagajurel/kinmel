import * as dotenv from 'dotenv';
import * as path from 'path';


dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth_router';
import swaggerUi from 'swagger-ui-express';
import { redisClient } from '@packages/lib/redis';

const swaggerDocument = require('./swagger-output.json');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {

  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[BODY]`, JSON.stringify(req.body));
  }
  next();
});

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.get('/health', async (req, res) => {
  const results: any = { timestamp: new Date().toISOString() };

  try {
    const ping = await redisClient.ping();
    results.redis = { status: 'ok', ping };
  } catch (e: any) {
    results.redis = { status: 'error', message: e.message };
  }

  try {
    const prisma = require('@packages/lib/prisma').default;
    await prisma.$connect();
    results.database = { status: 'ok' };
    await prisma.$disconnect();
  } catch (e: any) {
    results.database = { status: 'error', message: e.message };
  }

  res.json(results);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});


app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const host = process.env.HOST || 'localhost';

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(port, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});

server.on('error', (err) => {
  console.log('Server Error: ', err);
});
