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
import { FindOrCreateConversationUseCase } from '../../application/use-cases/find-or-create-conversation.js';
import { GetMessagesUseCase } from '../../application/use-cases/get-messages.js';
import { GetUserConversationsUseCase } from '../../application/use-cases/get-user-conversations.js';
import { SupabaseChatAdapter } from '../adapters/supabase-chat.adapter.js';
import { supabase } from '../../../../core/database.js';
import { PublishSpaceUseCase } from '../../application/use-cases/publish-space.js';
import { ListSpacesUseCase } from '../../application/use-cases/list-spaces.js';
import { UpdateSpaceUseCase } from '../../application/use-cases/update-space.js';
import { UnpublishSpaceUseCase } from '../../application/use-cases/unpublish-space.js';
import { SupabaseSpaceAdapter } from '../adapters/supabase-space.adapter.js';
import { PublishSpaceDto } from '../../domain/dtos/publish-space.dto.js';
import { UpdateSpaceDto } from '../../domain/dtos/update-space.dto.js';
import { RequestToJoinUseCase } from '../../application/use-cases/request-to-join.js';
import { ResolveJoinRequestUseCase } from '../../application/use-cases/resolve-join-request.js';
import { GetDepartmentMembersUseCase } from '../../application/use-cases/get-department-members.js';
import { SupabaseMembershipAdapter } from '../adapters/supabase-membership.adapter.js';
import { SupabaseNotificationAdapter } from '../adapters/supabase-notification.adapter.js';
import {
  CreateSpaceRequestDto,
  ResolveSpaceRequestDto
} from '../../domain/dtos/space-request.dto.js';

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

  // =================================================================
  // 🔥 OBTENER PERFIL DEL USUARIO LOGUEADO (Con Logs de Diagnóstico)
  // =================================================================
  public async getMe(req: Request, res: Response): Promise<void> {
    try {
      console.log("\n📢 [FINANZAS 1/4] Petición GET recibida en /api/v1/identity/me");
      
      const email = (req as any).auth?.email;
      console.log(`📢 [FINANZAS 2/4] Email extraído del Token de Kinde: ${email || 'NINGUNO'}`);
      
      if (!email) {
        console.log("❌ Error: El token JWT no mandó ningún email.");
        res.status(400).json({ status: "error", message: "El token JWT no contiene un email." });
        return;
      }

      console.log("📢 [FINANZAS 3/4] Buscando al usuario en Supabase...");
      const adapter = new SupabaseUserAdapter();
      const user = await adapter.findByEmail(email); 

      if (!user) {
        console.log(`❌ Error: El correo ${email} no existe en la tabla de usuarios.`);
        res.status(404).json({ status: "not_registered", message: "Usuario no encontrado." });
        return;
      }
      
      const userId = (user as any).id;
      console.log(`✅ ¡Usuario encontrado! Su UUID es: ${userId}`);

   
      const settings = await adapter.getProfileSettings(userId);
      console.log(`📢 [FINANZAS 4/4] Presupuesto máximo del usuario: $${settings?.maxBudget || 250}`);

     
      const { data: department } = await supabase
        .from('departments')
        .select('id')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      res.status(200).json({
        data: {
          id: userId,
          email: email,
          monthlyBudget: settings?.maxBudget || 250,
          minBudget: settings?.minBudget ?? null,
          roomType: settings?.roomType ?? null,
          expenseManagement: settings?.expenseManagement ?? null,
          sharedItems: settings?.sharedItems ?? [],
          preferredCommonAreas: settings?.preferredCommonAreas ?? [],
          departmentId: department?.id ?? null
        }
      });
    } catch (error: any) {
      console.error("🔥 EXPLOSIÓN EN EL CONTROLADOR GET ME:", error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }
  public async initializeConversation(req: Request, res: Response): Promise<void> {
    try {
    
      const { currentUserId, targetUserId } = req.body;

      if (!currentUserId || !targetUserId) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Faltan IDs de usuarios.' });
        return;
      }

      const useCase = new FindOrCreateConversationUseCase(new SupabaseChatAdapter());
      const conversationId = await useCase.execute(currentUserId, targetUserId);

      res.status(200).json({ conversationId });
    } catch (error: any) {
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }

  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const useCase = new GetMessagesUseCase(new SupabaseChatAdapter());
      const messages = await useCase.execute(conversationId as string, limit, offset);

      res.status(200).json(messages);
    } catch (error: any) {
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }

  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { senderId, content } = req.body;

      if (!senderId || !content) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Faltan datos del mensaje.' });
        return;
      }

      const adapter = new SupabaseChatAdapter();
      const newMessage = await adapter.saveMessage(conversationId as string, senderId, content);

   
      try {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId as string)
          .neq('user_id', senderId);

        const notifier = new SupabaseNotificationAdapter();
        for (const participant of participants || []) {
          await notifier.create({
            userId: participant.user_id,
            type: 'new_message',
            title: 'Nuevo mensaje',
            body: String(content).slice(0, 80),
            resourceId: conversationId as string
          });
        }
      } catch (notifyError: any) {
        console.error('⚠️ No se pudo notificar el mensaje:', notifyError.message);
      }

      res.status(201).json(newMessage);
    } catch (error: any) {
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }


  public async getInbox(req: Request, res: Response): Promise<void> {
    try {
      const useCase = new GetUserConversationsUseCase(new SupabaseChatAdapter());
      const conversations = await useCase.execute(req.params.userId as string);
      res.status(200).json({ data: conversations });
    } catch (error: any) {
      console.error('🚨 Error listando conversaciones:', error.message);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }


  public async createSpace(req: Request, res: Response): Promise<void> {
    try {
  
      const { ownerId, ...payload } = req.body;
      const dto = plainToInstance(PublishSpaceDto, payload);

      const useCase = new PublishSpaceUseCase(new SupabaseSpaceAdapter());
      const newSpace = await useCase.execute(ownerId, dto);

      res.status(201).json(newSpace);
    } catch (error: any) {
   
      console.error('🚨 Error crítico publicando:', error);
      logger.error(`Error publicando espacio: ${error.message}`);


      if (
        error.message.includes('Faltan campos') ||
        error.message.includes('obligatorio') ||
        error.message.includes('obligatoria') ||
        error.message.includes('al menos') ||
        error.message.includes('5 fotos') ||
        error.message.includes('mayor a cero')
      ) {
        res.status(400).json({ error: 'BAD_REQUEST', message: error.message });
        return;
      }


      if (error.message.includes('violates foreign key constraint')) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: `Referencia inválida en la publicación: ${error.message}`,
        });
        return;
      }

      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }

  public async listSpaces(_req: Request, res: Response): Promise<void> {
    try {
      const useCase = new ListSpacesUseCase(new SupabaseSpaceAdapter());
      const spaces = await useCase.execute();
      res.status(200).json({ data: spaces });
    } catch (error: any) {
      logger.error(`Error listando espacios: ${error.message}`);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }


  private async resolveRequesterId(req: Request): Promise<string | null> {
    const email = (req as any).auth?.email;
    if (!email) return null;
    const adapter = new SupabaseUserAdapter();
    const user = await adapter.findByEmail(String(email).trim().toLowerCase());
    return user ? (user as any).id : null;
  }


  private spaceErrorToStatus(message: string): number {
    if (message.includes('no fue encontrado')) return 404;
    if (message.includes('Solo el dueño')) return 403;
    if (message.includes('obligatorio') || message.includes('vacío') ||
        message.includes('vacía') || message.includes('al menos') ||
        message.includes('mayor a cero') || message.includes('ningún campo')) {
      return 400;
    }
    return 500;
  }


  public async updateSpace(req: Request, res: Response): Promise<void> {
    try {
      const requesterId = await this.resolveRequesterId(req);
      if (!requesterId) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Tu usuario no existe en RoomieSmart.' });
        return;
      }

      const dto = plainToInstance(UpdateSpaceDto, req.body);
      const useCase = new UpdateSpaceUseCase(new SupabaseSpaceAdapter());
      const updated = await useCase.execute(req.params.id as string, requesterId, dto);

      res.status(200).json(updated);
    } catch (error: any) {
      console.error('🚨 Error editando espacio:', error);
      logger.error(`Error editando espacio: ${error.message}`);
      const status = this.spaceErrorToStatus(error.message);
      res.status(status).json({
        error: status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_REJECTED',
        message: error.message
      });
    }
  }


  private requestErrorToStatus(message: string): number {
    if (message.includes('no fue encontrado') || message.includes('no fue encontrada')) return 404;
    if (message.includes('Solo el dueño')) return 403;
    if (
      message.includes('obligatorio') ||
      message.includes('obligatoria') ||
      message.includes('pendiente para este espacio') ||
      message.includes('tu propio espacio') ||
      message.includes('Ya eres miembro') ||
      message.includes('ya fue resuelta') ||
      message.includes("La acción debe ser")
    ) {
      return 400;
    }
    return 500;
  }


  public async requestToJoin(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(CreateSpaceRequestDto, req.body);
      const useCase = new RequestToJoinUseCase(
        new SupabaseMembershipAdapter(),
        new SupabaseSpaceAdapter(),
        new SupabaseNotificationAdapter()
      );
      const request = await useCase.execute(req.params.id as string, dto);
      res.status(201).json(request);
    } catch (error: any) {
      console.error('🚨 Error creando solicitud de unión:', error.message);
      const status = this.requestErrorToStatus(error.message);
      res.status(status).json({
        error: status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_REJECTED',
        message: error.message
      });
    }
  }


  public async listPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.query.ownerId as string;
      if (!ownerId) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Falta el ownerId en la consulta.' });
        return;
      }
      const adapter = new SupabaseMembershipAdapter();
      const requests = await adapter.findPendingRequestsByOwner(ownerId);
      res.status(200).json({ data: requests });
    } catch (error: any) {
      console.error('🚨 Error listando solicitudes:', error.message);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }


  public async resolveRequest(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(ResolveSpaceRequestDto, req.body);
      const useCase = new ResolveJoinRequestUseCase(
        new SupabaseMembershipAdapter(),
        new SupabaseSpaceAdapter(),
        new SupabaseNotificationAdapter()
      );
      const resolved = await useCase.execute(req.params.id as string, dto);
      res.status(200).json(resolved);
    } catch (error: any) {
      console.error('🚨 Error resolviendo solicitud:', error.message);
      const status = this.requestErrorToStatus(error.message);
      res.status(status).json({
        error: status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_REJECTED',
        message: error.message
      });
    }
  }


  public async getDepartmentMembers(req: Request, res: Response): Promise<void> {
    try {
      const useCase = new GetDepartmentMembersUseCase(new SupabaseMembershipAdapter());
      const result = await useCase.execute(req.params.id as string);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('🚨 Error listando miembros:', error.message);
      const status = this.requestErrorToStatus(error.message);
      res.status(status).json({
        error: status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_REJECTED',
        message: error.message
      });
    }
  }


  public async deleteSpace(req: Request, res: Response): Promise<void> {
    try {
      const requesterId = await this.resolveRequesterId(req);
      if (!requesterId) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Tu usuario no existe en RoomieSmart.' });
        return;
      }

      const useCase = new UnpublishSpaceUseCase(new SupabaseSpaceAdapter());
      await useCase.execute(req.params.id as string, requesterId);

      res.status(200).json({ message: 'Publicación dada de baja correctamente.' });
    } catch (error: any) {
      console.error('🚨 Error dando de baja espacio:', error);
      logger.error(`Error dando de baja espacio: ${error.message}`);
      const status = this.spaceErrorToStatus(error.message);
      res.status(status).json({
        error: status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_REJECTED',
        message: error.message
      });
    }
  }
}