import 'reflect-metadata';
import express from 'express';
import cors from 'cors'; 
import roomieRoutes from './modules/roomies/infraestructure/http/roomie.routes.js';
import profileRoutes from './modules/roomies/infraestructure/http/profile.routes.js';
import { logger } from './core/logger.js';

const app = express();

// Middlewares
app.use(express.json());

// Cors configuration 
app.use(cors()); 

// Endpoints
app.use(roomieRoutes);
app.use(profileRoutes);

app.listen(3000, '0.0.0.0', () => {
  logger.info('Servidor corriendo en puerto 3000 (Escuchando en 0.0.0.0 para Docker)');
});