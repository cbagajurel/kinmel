import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import * as path from 'path';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  }),
);

app.use(morgan('dev'));
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use(express.json({ limit: '100mb' }));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
