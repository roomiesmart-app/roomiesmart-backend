import { supabase } from '../../../../core/database.js';
import type { IUserRepository } from '../../application/ports/user.repository.js';
import { User } from '../../domain/user.model.js';

export class SupabaseUserAdapter implements IUserRepository {
  public async save(user: User): Promise<void> {
    const { error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        password_hash: user.password_hash, 
        preferences: user.preferences,     
        created_at: user.created_at.toISOString() 
      });

    if (error) {
      
      throw new Error(`Error en Supabase: ${error.message}`);
    }
  }
}