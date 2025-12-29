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

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

//Routes

app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const host = process.env.HOST || 'localhost';

// Redis error handler
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

// Global error handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(port, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});

server.on('error', (err) => {
  console.log('Server Error: ', err);
});
