import type { Request, Response, NextFunction } from 'express';
import * as KindeValidator from '@kinde/jwt-validator';
import { logger } from '../logger.js';


console.log("--- ESTRUCTURA DE KINDE ---", KindeValidator); 

const verifierFactory = (KindeValidator as any).jwtVerify || (KindeValidator as any).default || KindeValidator;

// Inicializamos el validador
const verifier = verifierFactory(process.env.KINDE_ISSUER_URL as string);

export async function requireKindeAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'UNAUTHORIZED', 
      message: 'Acceso denegado: Falta el token de Kinde.' 
    });
    return;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      verifier(req as any, res as any, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const user = (req as any).user;
    const externalId = user?.sub || user?.id;

    if (!externalId) {
      throw new Error('El token es auténtico pero no contiene un ID de sujeto.');
    }

    (req as any).auth = {
      externalId: externalId,
      email: user?.email
    };

    next();
  } catch (error: any) {
    logger.warn(`Intento de penetración con Token Kinde fallido: ${error.message}`);
    res.status(401).json({ 
      error: 'UNAUTHORIZED', 
      message: 'Token de sesión inválido.' 
    });
  }
}