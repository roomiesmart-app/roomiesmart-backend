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
    
    let { data } = await supabase.from(tableName).select('id').ilike('name', nameValue).single();
    
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
  // Save normal (con contraseña)
  // =================================================================
  public async save(user: User): Promise<void> {
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
      if (userError.code === '23505' || userError.message.includes('duplicate key')) {
        throw new Error('El correo institucional ingresado ya se encuentra registrado. Por favor, inicia sesión.');
      }
      throw new Error(`DB Error insertando usuario: ${userError.message}`);
    }

    const userId = authUser.id;

    const cityId = await this.getOrCreateCatalogId('cities', user.preferences?.profile?.birthCity);
    const careerId = await this.getOrCreateCatalogId('careers', user.preferences?.profile?.career);

    await supabase.from('user_profiles').insert({
      user_id: userId,
      age: user.preferences?.profile?.age,
      gender: user.preferences?.profile?.gender,
      birth_city_id: cityId,
      career_id: careerId,
      semester: user.preferences?.profile?.semester
    });

    await supabase.from('user_lifestyle').insert({
      user_id: userId,
      cleaning_frequency: user.preferences?.lifestyle?.cleaningFrequency,
      is_early_bird: user.preferences?.lifestyle?.isEarlyBird,
      use_common_areas_at_night: user.preferences?.lifestyle?.useCommonAreasAtNight
    });

    await supabase.from('user_social_preferences').insert({
      user_id: userId,
      pet_preference: user.preferences?.social?.petPreference,
      smoking_preference: user.preferences?.social?.smokingPreference,
      social_level: user.preferences?.social?.socialLevel
    });

    await supabase.from('user_financial_preferences').insert({
      user_id: userId,
      min_budget: user.preferences?.financial?.budgetRange?.min,
      max_budget: user.preferences?.financial?.budgetRange?.max,
      room_type: user.preferences?.financial?.roomType
    });
  }

  // =================================================================
  // FindByEmail (Sirve para el login normal y para el check-status de UCE)
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
    
    (user as any).id = data.id; 
    return user;
  }

  // =================================================================
  // Guardar usuario federado (Kinde SSO Onboarding)
  // =================================================================
  public async saveOnboardingUser(dto: any): Promise<any> {
    const { data: authUser, error: userError } = await supabase
      .from('users')
      .insert({
        name: dto.profile.fullName,
        email: dto.identity.email,
        kinde_external_id: dto.identity.externalId,
        password_hash: 'SSO_KINDE_FEDERATED_USER',
        created_at: new Date().toISOString()
      })
      .select('id, email')
      .single();

    if (userError) {
      if (userError.code === '23505' || userError.message.includes('duplicate key')) {
        throw new Error('El correo institucional ingresado ya se encuentra registrado. Por favor, inicia sesión.');
      }
      throw new Error(`Error BD insertando usuario SSO: ${userError.message}`);
    }

    const userId = authUser.id;

    // 2. Resolvemos los catálogos usando tu propia función privada
    const cityId = await this.getOrCreateCatalogId('cities', dto.profile.birthCity);
    const careerId = await this.getOrCreateCatalogId('careers', dto.profile.career);

    // 3. Guardamos su perfil inicial
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        age: dto.profile.age,
        gender: dto.profile.gender,
        birth_city_id: cityId,
        career_id: careerId,
        semester: dto.profile.currentSemester?.toString() // Casteado a string por si acaso
      });

    if (profileError) {
      throw new Error(`Error BD insertando perfil de Onboarding: ${profileError.message}`);
    }

    return authUser;
  }

  // =================================================================
  // Matchmaking: Get Profiles
  // =================================================================
  public async getProfilesForMatchmaking(): Promise<MatchmakingCardDto[]> {
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

    return data.map((user: any) => {
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

  public async updateProfileSettings(userId: string, data: any): Promise<void> {
    if (data.hobbies !== undefined) {
      const { error: socialError } = await supabase
        .from('user_social_preferences')
        .upsert({ user_id: userId, hobbies: data.hobbies }, { onConflict: 'user_id' });
      if (socialError) throw new Error(`Error guardando preferencias sociales: ${socialError.message}`);
    }

    if (data.isEarlyBird !== undefined) {
      const { error: lifestyleError } = await supabase
        .from('user_lifestyle')
        .upsert({ user_id: userId, is_early_bird: data.isEarlyBird }, { onConflict: 'user_id' });
      if (lifestyleError) throw new Error(`Error guardando estilo de vida: ${lifestyleError.message}`);
    }

    if (data.minBudget !== undefined || data.maxBudget !== undefined) {
      const { error: financialError } = await supabase
        .from('user_financial_preferences')
        .upsert({ user_id: userId, min_budget: data.minBudget, max_budget: data.maxBudget }, { onConflict: 'user_id' });
      if (financialError) throw new Error(`Error guardando presupuesto: ${financialError.message}`);
    }
  }

  public async getProfileSettings(userId: string): Promise<any> {
    const { data: socialData } = await supabase
      .from('user_social_preferences')
      .select('hobbies')
      .eq('user_id', userId)
      .single();

    const { data: lifestyleData } = await supabase
      .from('user_lifestyle')
      .select('is_early_bird')
      .eq('user_id', userId)
      .single();

    const { data: financialData } = await supabase
      .from('user_financial_preferences')
      .select('min_budget, max_budget')
      .eq('user_id', userId)
      .single();

    return {
      userId,
      isEarlyBird: lifestyleData?.is_early_bird ?? null,
      hobbies: socialData?.hobbies ?? [],
      minBudget: financialData?.min_budget ?? null,
      maxBudget: financialData?.max_budget ?? null
    };
  }
}