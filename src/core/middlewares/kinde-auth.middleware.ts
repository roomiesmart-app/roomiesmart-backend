import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from '@kinde/jwt-validator'; // 🔥 Ahora sí: El paquete oficial de APIs
import { logger } from '../logger.js';

// Le pasamos tu dominio oficial de Kinde
const verifier = jwtVerify(process.env.KINDE_ISSUER_URL as string);

export async function requireKindeAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'UNAUTHORIZED', 
      message: 'Acceso denegado: Falta el token de Kinde en el header Authorization.' 
    });
    return;
  }

  try {
    // El verificador consulta las llaves públicas de Kinde en internet y valida la firma
    await new Promise<void>((resolve, reject) => {
      verifier(req as any, res as any, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Kinde inyecta el token decodificado automáticamente dentro de req.user
    const user = (req as any).user;
    const externalId = user?.sub || user?.id;

    if (!externalId) {
      throw new Error('El token es auténtico pero no contiene un ID de sujeto (sub).');
    }

    // Le pasamos el ID limpio a tu RoomieController intacto
    (req as any).auth = {
      externalId: externalId
    };

    next();
  } catch (error: any) {
    logger.warn(`Intento de penetración con Token Kinde fallido: ${error.message}`);
    res.status(401).json({ 
      error: 'UNAUTHORIZED', 
      message: 'Token de sesión de Kinde inválido o expirado. Vuelva a iniciar sesión.' 
    });
  }
}