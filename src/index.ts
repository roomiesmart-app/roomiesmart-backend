import 'reflect-metadata';
import http from 'http';
import express from 'express';
import cors, { type CorsOptions } from 'cors';
import roomieRoutes from './modules/roomies/infraestructure/http/roomie.routes.js';
import profileRoutes from './modules/roomies/infraestructure/http/profile.routes.js';
import { logger } from './core/logger.js';
import expenseRoutes from './modules/expenses/infraestructure/http/expense.routes.js';
import { initChatGateway } from './modules/roomies/infraestructure/ws/chat.gateway.js';

const app = express();


app.use(express.json());

const allowedOrigins = [
  'http://localhost:3002',
  'http://localhost:3001',
  'http://localhost:3000',

  'http://52.7.189.106',
  'http://52.7.189.106:8080',

  'http://52.203.167.254',
  'http://roomiesmartqa.programacionwebuce.net',
  'https://roomiesmartqa.programacionwebuce.net',

  'http://3.208.173.154',
  'http://roomiesmartprod.programacionwebuce.net',
  'https://roomiesmartprod.programacionwebuce.net',


  'https://roomiesmart.lat',
  'http://roomiesmart.lat',
  'https://qa.roomiesmart.lat',
  'http://qa.roomiesmart.lat',
  'https://prod.roomiesmart.lat',
  'http://prod.roomiesmart.lat',


  process.env.CLIENT_ORIGIN
].filter(Boolean) as string[];
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Intento de acceso bloqueado por CORS desde el origen: ${origin}`);
      callback(new Error('Bloqueado por CORS: Origen no autorizado'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions));


app.use(roomieRoutes);
app.use(profileRoutes);
app.use('/api/expenses', expenseRoutes);

const server = http.createServer(app);
initChatGateway(server, allowedOrigins);

server.listen(3000, '0.0.0.0', () => {
  logger.info('Servidor HTTP + WebSocket corriendo en puerto 3000 (0.0.0.0 para Docker)');
});