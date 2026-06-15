// ============================================================================
// VALUE OBJECTS (Domain Interfaces)
// In DDD, these define the strict structure of our business data.
// ============================================================================

export interface UserProfileDomain {
  age: number;
  gender: string;
  career: string;
  semester: string;
  birthCity: string;
}

export interface LifestyleDomain {
  cleaningFrequency: 'diaria' | '2-3 veces' | 'semanal';
  isEarlyBird: boolean;
  useCommonAreasAtNight: boolean;
  sharedTasks: string[];
}

export interface SocialDomain {
  hobbies: string[];
  musicGenres: string[];
  petPreference: 'tengo' | 'no-molestan' | 'no-tengo';
  smokingPreference: 'fumo' | 'no-fumo' | 'no-tolero';
  socialLevel: 'no-social' | 'dependiendo' | 'muy-social';
}

export interface FinancialDomain {
  budgetRange: { min: number; max: number };
  roomType: 'privada' | 'compartida';
  preferredCommonAreas: string[];
  expenseManagement: 'fondo-comun' | 'division-digital' | 'individual';
  sharedItems: string[];
}

export interface UserPreferences {
  profile?: UserProfileDomain;
  lifestyle?: LifestyleDomain;
  social?: SocialDomain;
  financial?: FinancialDomain;
}

// ============================================================================
// ENTITY (The Main Domain Entity)
// ============================================================================

export class User {
  private constructor(
    public readonly id: string | null,
    public name: string,
    public email: string,
    public password_hash: string,
    public preferences: UserPreferences, 
    public ai_embedding: number[] | null,
    public readonly created_at: Date
  ) {}

  public static create(
    name: string,
    email: string,
    password_hash: string,
    preferences: UserPreferences = {}, // Initialize with an empty object that fulfills the interface
    id: string | null = null,
    ai_embedding: number[] | null = null,
    created_at: Date = new Date()
  ): User {
    const user = new User(id, name, email, password_hash, preferences, ai_embedding, created_at);
    user.validate();
    return user;
  }

  get password(): string {
    return this.password_hash;
  }

  // The unbreakable rules of our business (Invariants)
  private validate(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Domain Error: El nombre debe tener al menos 2 caracteres.');
    }

    const uceEmailRegex = /^[a-zA-Z0-9._%+-]+@uce\.edu\.ec$/;
    if (!this.email || !uceEmailRegex.test(this.email)) {
      throw new Error('Domain Error: El correo debe ser institucional y terminar en @uce.edu.ec.');
    }

    if (!this.password_hash || this.password_hash.trim().length === 0) {
      throw new Error('Domain Error: El hash de la contraseña es requerido por seguridad.');
    }
  }
}