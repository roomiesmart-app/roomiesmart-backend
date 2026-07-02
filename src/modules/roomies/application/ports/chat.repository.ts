export interface IChatRepository {
  findOrCreateConversation(userId: string, targetUserId: string): Promise<string>;
  getConversationMessages(conversationId: string, limit: number, offset: number): Promise<any[]>;
  saveMessage(conversationId: string, senderId: string, content: string): Promise<any>;
}