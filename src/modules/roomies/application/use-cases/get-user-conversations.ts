import type { IChatRepository } from '../ports/chat.repository.js';

export class GetUserConversationsUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  public async execute(userId: string): Promise<any[]> {
    if (!userId) throw new Error('El ID del usuario es obligatorio.');
    return await this.chatRepository.listUserConversations(userId);
  }
}
