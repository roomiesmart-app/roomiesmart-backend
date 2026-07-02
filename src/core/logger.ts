import winston from 'winston';

// Configuramos cómo queremos que se vean los mensajes
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

export const logger = winston.createLogger({
  level: 'info', // Nivel mínimo que va a registrar
  format: logFormat,
  transports: [
    // 1. Mostrar los logs en la consola (con colores para que sea fácil leer)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // 2. Guardar los errores graves en un archivo de texto
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // 3. Guardar absolutamente todo el historial en otro archivo
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});