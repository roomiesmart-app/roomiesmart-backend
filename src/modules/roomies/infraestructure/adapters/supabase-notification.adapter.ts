import { supabase } from '../../../../core/database.js';
import type {
  INotificationRepository,
  NotificationInput
} from '../../application/ports/notification.repository.js';

export class SupabaseNotificationAdapter implements INotificationRepository {
  public async create(notification: NotificationInput): Promise<void> {
    
    const { error } = await supabase.from('notifications').insert({
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body || null,
      resource_id: notification.resourceId || null
    });

    if (error) {
      console.error('⚠️ No se pudo crear la notificación:', error.message);
    }
  }
}
