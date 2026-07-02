import { supabase } from '../../../../core/database.js';
import type { IChatRepository } from '../../application/ports/chat.repository.js';

export class SupabaseChatAdapter implements IChatRepository {
  
  public async findOrCreateConversation(userId: string, targetUserId: string): Promise<string> {
    const { data: myChats, error: myChatsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (myChatsError) throw new Error(myChatsError.message);

    if (myChats && myChats.length > 0) {
      const chatIds = myChats.map(c => c.conversation_id);
      
      const { data: sharedChat } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', chatIds)
        .eq('user_id', targetUserId)
        .limit(1)
        .single();

      if (sharedChat) return sharedChat.conversation_id;
    }

    const { data: newChat, error: newChatError } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single();

    if (newChatError) throw new Error(newChatError.message);

    await supabase.from('conversation_participants').insert([
      { conversation_id: newChat.id, user_id: userId },
      { conversation_id: newChat.id, user_id: targetUserId }
    ]);

    return newChat.id;
  }

  public async getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`id, sender_id, content, is_read, created_at`)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return data || [];
  }

  public async saveMessage(conversationId: string, senderId: string, content: string): Promise<any> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      })
      .select('id, sender_id, content, is_read, created_at')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}