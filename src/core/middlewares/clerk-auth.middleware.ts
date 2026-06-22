import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { logger } from '../logger.js';

export async function requireClerkAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'UNAUTHORIZED', 
      message: 'Acceso denegado: Falta el token de Clerk en el header Authorization.' 
    });
    return;
  }

  // 🔥 OPCIÓN NUCLEAR 1: Extraemos el token con .replace() 
  // (En TypeScript, hacer .replace() sobre un string SIEMPRE da como resultado otro string puro, jamás undefined)
  const token = authHeader.replace('Bearer ', '').trim();

  try {
    // 🔥 OPCIÓN NUCLEAR 2: Le clavamos un segundo "as string" directamente en la garganta a la función
    const verifiedToken = await verifyToken(token as string, {
      secretKey: process.env.CLERK_SECRET_KEY as string
    });

    (req as any).auth = {
      externalId: verifiedToken.sub
    };

    next();
  } catch (error: any) {
    logger.warn(`Intento de penetración con Token JWT fallido: ${error.message}`);
    res.status(401).json({ 
      error: 'UNAUTHORIZED', 
      message: 'Token de sesión inválido o expirado. Vuelva a iniciar sesión.' 
    });
  }
}