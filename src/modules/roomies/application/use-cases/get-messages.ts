import type { IChatRepository } from '../ports/chat.repository.js';

export class GetMessagesUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  public async execute(conversationId: string, limit: number, offset: number): Promise<any[]> {
    return await this.chatRepository.getConversationMessages(conversationId, limit, offset);
  }
}