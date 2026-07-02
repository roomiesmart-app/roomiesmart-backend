import type { IChatRepository } from '../ports/chat.repository.js';

export class FindOrCreateConversationUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  public async execute(currentUserId: string, targetUserId: string): Promise<string> {
    if (currentUserId === targetUserId) {
      throw new Error('No puedes crear una conversación contigo mismo.');
    }
    return await this.chatRepository.findOrCreateConversation(currentUserId, targetUserId);
  }
}