import type { Request, Response, NextFunction } from "express";
import { validateToken } from "@kinde/jwt-validator";
import { logger } from "../logger.js";

export async function requireKindeAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Acceso denegado: Falta el token de Kinde."
    });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    // 1. Validar el token con Kinde
    const validationResult = await validateToken({
      token,
      domain: process.env.KINDE_ISSUER_URL as string
    });

    if (!validationResult.valid) {
      throw new Error(validationResult.message);
    }

    // 2. Decodificar el token manualmente para ver qué trae el payload
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Formato de JWT inválido.");
    }

    const payload = JSON.parse(
      Buffer.from(parts[1]!, "base64url").toString()
    );

    // 🔥 DEBUG CRÍTICO: Esto nos dirá qué está llegando realmente
    console.log("📢 DEBUG: Payload completo del token:", JSON.stringify(payload, null, 2));

    // 3. Guardar la info en el request
    (req as any).auth = {
      externalId: payload.sub,
      email: payload.email || payload.preferred_username || null
    };

    next();
  } catch (error: any) {
    logger.warn(`Token inválido: ${error.message}`);
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Token inválido o expirado."
    });
  }
}