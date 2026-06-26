import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from '@kinde/jwt-validator';
import { logger } from '../logger.js';

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

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    await new Promise<void>((resolve, reject) => {
      verifier(req as any, res as any, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Decodificamos de forma segura para extraer el ID y el correo institucional
    const base64Url = token.split('.')[1] as string;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

    const externalId = payload.sub || payload.id;
    const email = payload.email;

    if (!externalId) {
      throw new Error('El token es auténtico pero no contiene un ID de sujeto (sub).');
    }

    // Pasamos el contexto limpio a la request de Express
    (req as any).auth = {
      externalId: externalId,
      email: email
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