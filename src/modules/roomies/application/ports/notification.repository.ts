export interface NotificationInput {
  userId: string;
  type: 'new_message' | 'join_request' | 'request_accepted' | 'request_rejected';
  title: string;
  body?: string;
  resourceId?: string;
}

export interface INotificationRepository {

  create(notification: NotificationInput): Promise<void>;
}
