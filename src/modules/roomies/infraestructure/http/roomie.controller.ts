import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer'; 
import { RegisterUserUseCase } from '../../application/use-cases/register-user.js';
import { SupabaseUserAdapter } from '../adapters/supabase-user.adapter.js';
import { CreateUserDto } from '../../domain/dtos/create-user.dto.js'; 
import { LoginUserUseCase } from '../../application/use-cases/login-user.js'; 
import { LoginUserDto } from '../../domain/dtos/login-user.dto.js'; 
import { logger } from '../../../../core/logger.js';
import { CalculateCompatibilityUseCase } from '../../application/use-cases/calculate-compatibility.js';
import { GroqAiAdapter } from '../adapters/groq-ai.controller.js'; 
import { OnboardingRequestDto } from '../../domain/dtos/onboarding.dto.js';

export class RoomieController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(CreateUserDto, req.body);
      dto.validate();
      const useCase = new RegisterUserUseCase(new SupabaseUserAdapter());
      const newUser = await useCase.execute(dto);
      res.status(201).json(newUser);
    } catch (error: any) {
      logger.error(error.message);
      res.status(400).json({ error: 'VALIDATION_ERROR', message: error.message });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(LoginUserDto, req.body);
      const useCase = new LoginUserUseCase(new SupabaseUserAdapter());
      const response = await useCase.execute(dto);
      res.status(200).json(response);
    } catch (error: any) {
      logger.error(error.message);
      const status = error.message.includes('Auth Error') ? 401 : 400;
      res.status(status).json({ error: status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST', message: error.message });
    }
  }

  // =================================================================
  // 🔥 MATCHMAKING BLINDADO CON DIAGNÓSTICO EN TIEMPO REAL
  // =================================================================
  public async getMatchmakingCards(req: Request, res: Response): Promise<void> {
    try {
      console.log("\n📢 [1/4] Petición POST recibida en el controlador!");
      console.log("DEBUG Body:", JSON.stringify(req.body));
      
      const incomingId = req.body.userId;
      const filters = req.body.filters || {};

      if (!incomingId) {
        console.error("❌ Error: req.body.userId llegó vacío");
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Falta el userId en el body.' });
        return;
      }

      console.log("📢 [2/4] Instanciando repositorios y IA...");
      const userAdapter = new SupabaseUserAdapter();
      const aiAdapter = new GroqAiAdapter();
      const useCase = new CalculateCompatibilityUseCase(userAdapter, aiAdapter);

      console.log("📢 [3/4] Ejecutando CalculateCompatibilityUseCase...");
      const allMatches = await useCase.execute(incomingId, filters);

      console.log(`📢 [4/4] ¡Éxito! Devolviendo ${allMatches?.length || 0} cartas al frontend.`);
      res.status(200).json(allMatches);

    } catch (error: any) {
      console.error("🔥 EXPLOSIÓN EN EL CONTROLADOR DE MATCHMAKING:", error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }

  public async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.email) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Falta el parámetro email en la URL' });
        return;
      }
      const email = (req.params.email as string).trim().toLowerCase();
      if (!email.endsWith('@uce.edu.ec')) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'El sistema está restringido exclusivamente a cuentas institucionales @uce.edu.ec' });
        return;
      }
      const adapter = new SupabaseUserAdapter();
      const user = await adapter.findByEmail(email);
      res.status(200).json({ exists: !!user });
    } catch (error: any) {
      logger.error(`Error en checkStatus: ${error.message}`);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  public async onboarding(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(OnboardingRequestDto, req.body);
      dto.validate();
      dto.identity.email = dto.identity.email.trim().toLowerCase();
      const tokenExternalId = (req as any).auth?.externalId;

      if (!tokenExternalId || dto.identity.externalId !== tokenExternalId) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Discrepancia de credenciales federadas.' });
        return;
      }
      if (!dto.identity.email.endsWith('@uce.edu.ec')) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Dominio de correo ajeno a la UCE.' });
        return;
      }
      const adapter = new SupabaseUserAdapter();
      const newUser = await adapter.saveOnboardingUser(dto);
      res.status(201).json({ message: 'Registro exitoso vía Kinde SSO', userId: newUser.id });
    } catch (error: any) {
      res.status(400).json({ error: 'BAD_REQUEST', message: error.message });
    }
  }

  public async checkSession(req: Request, res: Response): Promise<void> {
    const { email } = (req as any).auth; 
    try {
      if (!email) {
        res.status(400).json({ status: "error", message: "El token JWT no contiene un email." });
        return;
      }
      const adapter = new SupabaseUserAdapter();
      const userExists = await adapter.findByEmail(email); 
      if (!userExists) {
        res.status(404).json({ status: "not_registered", message: "El usuario no existe en RoomieSmart." });
        return;
      }
      res.status(200).json({ status: "ok" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}