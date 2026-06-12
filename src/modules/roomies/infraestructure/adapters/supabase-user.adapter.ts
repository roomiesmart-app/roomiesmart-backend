import { supabase } from '../../../../core/database.js';
import type { IUserRepository } from '../../application/ports/user.repository.js';
import { User } from '../../domain/user.model.js';
import type { MatchmakingCardDto } from '../../domain/dtos/matchmaking-card.dto.js';

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

    if (userError) {
      // Duplicated email error handling (PostgreSQL error code 23505 for unique violation, or a message that includes 'duplicate key')
      if (userError.code === '23505' || userError.message.includes('duplicate key')) {
        throw new Error('El correo institucional ingresado ya se encuentra registrado. Por favor, inicia sesión.');
      }
      // if it's another type of error, throw a generic error message
      throw new Error(`DB Error insertando usuario: ${userError.message}`);
    }

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

  public async getProfilesForMatchmaking(): Promise<MatchmakingCardDto[]> {
    // Do a single query that joins all the necessary tables to get all the data we need for the matchmaking cards in one go. This is more efficient than doing multiple queries for each user.
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        ai_embedding,
        user_profiles ( birth_city_id ),
        user_lifestyle ( is_early_bird ),
        user_social_preferences ( hobbies, pet_preference, smoking_preference ),
        user_financial_preferences ( min_budget, max_budget, room_type )
      `);

    if (error) throw new Error(`Error obteniendo perfiles: ${error.message}`);
    if (!data) return [];

    // Mapping the raw data from the database into the MatchmakingCardDto format that our application uses. We also handle the case where Supabase might return related records as either an object or an array with one element, to ensure we always get the correct data.
    return data.map((user: any) => {
      // Supabase return relationships as either an object or an array with one element, depending on how the query is structured. We need to handle both cases to extract the related data correctly.
      const profile = Array.isArray(user.user_profiles) ? user.user_profiles[0] : user.user_profiles;
      const lifestyle = Array.isArray(user.user_lifestyle) ? user.user_lifestyle[0] : user.user_lifestyle;
      const social = Array.isArray(user.user_social_preferences) ? user.user_social_preferences[0] : user.user_social_preferences;
      const financial = Array.isArray(user.user_financial_preferences) ? user.user_financial_preferences[0] : user.user_financial_preferences;

      return {
        id: user.id,
        fullName: user.name,
        location: profile?.birth_city_id ? 'Ciudad Registrada' : 'Sin ubicación', 
        habits: {
          isEarlyBird: lifestyle?.is_early_bird ?? null,
          hobbies: social?.hobbies || [],
          petPreference: social?.pet_preference ?? null,
          smokingPreference: social?.smoking_preference ?? null,
        },
        budget: {
          min: financial?.min_budget ?? null,
          max: financial?.max_budget ?? null,
        },
        roomType: financial?.room_type ?? null,
        ai_embedding: user.ai_embedding ?? null
      };
    });
  }
}