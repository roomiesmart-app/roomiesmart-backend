import 'reflect-metadata';
import express from 'express';
import cors from 'cors'; // 1. Importa cors
import roomieRoutes from './modules/roomies/infraestructure/http/roomie.routes.js';

const app = express();

// Middlewares
app.use(express.json());

// Cors configuration 
app.use(cors()); 

// Endpoints
app.use(roomieRoutes);

app.listen(4000, () => {
  console.log('Servidor corriendo en puerto 4000');
});