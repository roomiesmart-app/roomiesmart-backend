import 'reflect-metadata';
import express from 'express';
import cors, { type CorsOptions } from 'cors';
import roomieRoutes from './modules/roomies/infraestructure/http/roomie.routes.js';
import profileRoutes from './modules/roomies/infraestructure/http/profile.routes.js';
import { logger } from './core/logger.js';
import expenseRoutes from './modules/expenses/infraestructure/http/expense.routes.js';

const app = express();

// Middlewares
app.use(express.json());


const allowedOrigins = [
  'http://localhost:5173', // Local with Vite
  
  'http://52.7.189.106', // Dev
  'http://52.7.189.106:8080', // Dev 8080
  
  'http://52.203.167.254', // QA IP
  'http://roomiesmartqa.programacionwebuce.net', // Domain QA (Nginx HTTP)
  'https://roomiesmartqa.programacionwebuce.net', // Domain QA (Cloudflare HTTPS)
  
  'http://3.208.173.154', // 🚀 IP cruda de Prod
  'http://roomiesmartprod.programacionwebuce.net', // Domain Prod (Nginx HTTP)
  'https://roomiesmartprod.programacionwebuce.net' // Domain Prod (Cloudflare HTTPS)
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      
      logger.warn(`Intento de acceso bloqueado por CORS desde el origen: ${origin}`);
      callback(new Error('Bloqueado por CORS: Origen no autorizado'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true 
};

app.use(cors(corsOptions));

// Endpoints
app.use(roomieRoutes);
app.use(profileRoutes);
app.use('/api/expenses', expenseRoutes);

app.listen(3000, '0.0.0.0', () => {
  logger.info('Servidor corriendo en puerto 3000 (Escuchando en 0.0.0.0 para Docker)');
});