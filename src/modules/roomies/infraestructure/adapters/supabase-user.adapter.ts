import { supabase } from '../../../../core/database.js';
import type { IUserRepository } from '../../application/ports/user.repository.js';
import { User } from '../../domain/user.model.js';

export class SupabaseUserAdapter implements IUserRepository {

  // =================================================================
  // Auxiliar function to get or create catalog entries (like cities or careers) and return their IDs
  // =================================================================
  private async getOrCreateCatalogId(tableName: string, nameValue: string | undefined): Promise<string | null> {
    if (!nameValue) return null;
    
    // 1. Search for the entry in the specified catalog table (cities or careers)
    let { data } = await supabase.from(tableName).select('id').ilike('name', nameValue).single();
    
    // if it doesn't exist, create it and return the new ID
    if (!data) {
      const { data: newData, error } = await supabase
        .from(tableName)
        .insert({ name: nameValue })
        .select('id')
        .single();
        
      if (error) throw new Error(`Error en catálogo ${tableName}: ${error.message}`);
      data = newData;
    }
    return data.id;
  }

  // =================================================================
  // Save method that now handles the complex logic of inserting into multiple tables to represent the user and their preferences in a normalized way
  // =================================================================
  public async save(user: User): Promise<void> {
    // 1. Save on table "users" first to get the generated user ID, which is needed for all the related tables (profile, lifestyle, social preferences, financial preferences)
    const { data: authUser, error: userError } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        created_at: user.created_at.toISOString() 
      })
      .select('id')
      .single();

    if (userError) throw new Error(`DB Error insertando usuario: ${userError.message}`);
    const userId = authUser.id;

    // 2. Obtain the IDs for the related catalog entries (like birth city and career) by either fetching existing ones or creating new ones if they don't exist
    const cityId = await this.getOrCreateCatalogId('cities', user.preferences?.profile?.birthCity);
    const careerId = await this.getOrCreateCatalogId('careers', user.preferences?.profile?.career);

    // 3. Save the user profile, lifestyle preferences, social preferences, and financial preferences in their respective tables, linking them with the user ID
    await supabase.from('user_profiles').insert({
      user_id: userId,
      age: user.preferences?.profile?.age,
      gender: user.preferences?.profile?.gender,
      birth_city_id: cityId,
      career_id: careerId,
      semester: user.preferences?.profile?.semester
    });

    // 4. Save LIFESTYLE
    await supabase.from('user_lifestyle').insert({
      user_id: userId,
      cleaning_frequency: user.preferences?.lifestyle?.cleaningFrequency,
      is_early_bird: user.preferences?.lifestyle?.isEarlyBird,
      use_common_areas_at_night: user.preferences?.lifestyle?.useCommonAreasAtNight
    });

    // 5. Save SOCIAL PREFERENCES
    await supabase.from('user_social_preferences').insert({
      user_id: userId,
      pet_preference: user.preferences?.social?.petPreference,
      smoking_preference: user.preferences?.social?.smokingPreference,
      social_level: user.preferences?.social?.socialLevel
    });

    // 6. Save FINANCIAL PREFERENCES
    await supabase.from('user_financial_preferences').insert({
      user_id: userId,
      min_budget: user.preferences?.financial?.budgetRange?.min,
      max_budget: user.preferences?.financial?.budgetRange?.max,
      room_type: user.preferences?.financial?.roomType
    });
  }

  // =================================================================
  // FindByEmail method that retrieves the user by email and reconstructs the User entity.
  // =================================================================
  public async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    
    const user = User.create(
      data.name, 
      data.email, 
      data.password_hash, 
      {} as any 
    );
    
    // Asign the ID from the database to the user entity (since the factory method doesn't know about the ID, we have to assign it manually here)
    (user as any).id = data.id; 
    
    return user;
  }
}