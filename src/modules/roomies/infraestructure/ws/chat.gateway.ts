import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { SupabaseChatAdapter } from '../adapters/supabase-chat.adapter.js';
import { SupabaseNotificationAdapter } from '../adapters/supabase-notification.adapter.js';
import { supabase } from '../../../../core/database.js';
import { logger } from '../../../../core/logger.js';

// ============================================================
// Gateway WebSocket (Socket.io) — Arquitectura Hexagonal:
// es OTRO adaptador de entrada (driving adapter), igual que el
// controlador HTTP. La persistencia sigue pasando por el MISMO
// SupabaseChatAdapter: la lógica de dominio no se duplica.
//
// DevOps: se adjunta al servidor HTTP existente (puerto 3000),
// NO abre puertos nuevos. Ver docs/DEVOPS-WEBSOCKETS.md en el
// repo del frontend para el bloque de nginx.
// ============================================================

interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
}

type Ack = (response: { ok: boolean; message?: any; error?: string }) => void;

export function initChatGateway(
  server: HttpServer,
  allowedOrigins: string[]
): Server {
  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const chatAdapter = new SupabaseChatAdapter();
  const notifier = new SupabaseNotificationAdapter();

  io.on('connection', (socket) => {
    logger.info(`🔌 WS conectado: ${socket.id}`);

    socket.on('join_conversation', (conversationId: string) => {
      if (typeof conversationId === 'string' && conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('leave_conversation', (conversationId: string) => {
      if (typeof conversationId === 'string' && conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on('send_message', async (payload: SendMessagePayload, ack?: Ack) => {
      try {
        const { conversationId, senderId, content } = payload || ({} as SendMessagePayload);
        if (!conversationId || !senderId || !content) {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'Faltan datos del mensaje.' });
          }
          return;
        }

        const message = await chatAdapter.saveMessage(
          conversationId,
          senderId,
          String(content)
        );

        // Difunde a todos los sockets unidos a la conversación (incluido
        // el emisor, que deduplica por id en el cliente).
        io.to(`conversation:${conversationId}`).emit('new_message', message);

        // Notificación best-effort al resto de participantes (campanita)
        try {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)
            .neq('user_id', senderId);

          for (const participant of participants || []) {
            await notifier.create({
              userId: participant.user_id,
              type: 'new_message',
              title: 'Nuevo mensaje',
              body: String(content).slice(0, 80),
              resourceId: conversationId
            });
          }
        } catch (notifyError: any) {
          logger.warn(`WS: notificación falló: ${notifyError.message}`);
        }

        if (typeof ack === 'function') ack({ ok: true, message });
      } catch (error: any) {
        logger.error(`WS send_message error: ${error.message}`);
        if (typeof ack === 'function') ack({ ok: false, error: error.message });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`🔌 WS desconectado: ${socket.id} (${reason})`);
    });
  });

  return io;
}
