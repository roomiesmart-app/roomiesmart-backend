// Interfaces para organizar el JSONB de las preferencias
export interface UserProfile {
  age: number;
  gender: string;
  career: string;
  semester: string;
  birthCity: string;
}

export interface LifestylePreferences {
  cleaningFrequency: 'diaria' | '2-3 veces' | 'semanal';
  isEarlyBird: boolean;
  useCommonAreasAtNight: boolean;
  sharedTasks: string[]; // ['Compras', 'Basura', ...]
}

export interface SocialPreferences {
  hobbies: string[];
  musicGenres: string[];
  petPreference: 'tengo' | 'no-molestan' | 'no-tengo';
  smokingPreference: 'fumo' | 'no-fumo' | 'no-tolero';
  socialLevel: 'no-social' | 'dependiendo' | 'muy-social';
}

export interface FinancialPreferences {
  budgetRange: { min: number; max: number };
  roomType: 'privada' | 'compartida';
  preferredCommonAreas: string[];
  expenseManagement: 'fondo-comun' | 'division-digital' | 'individual';
  sharedItems: string[];
}

// Dto important class 
export class CreateUserDto {
  name!: string;
  email!: string;
  password!: string;

  // this is the new field that will hold all the preferences in a structured way
  preferences!: {
    profile: UserProfile;
    lifestyle: LifestylePreferences;
    social: SocialPreferences;
    financial: FinancialPreferences;
  };

  // validation method that checks all the necessary fields and their formats
  public validate(): void {
    this.validatePassword();
    this.validateProfile();
  }

  private validatePassword(): void {
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      throw new Error('Validation Error: La contraseña debe tener al menos 8 caracteres y un símbolo especial.');
    }
  }

  private validateProfile(): void {
    if (this.preferences?.profile?.age < 17 || this.preferences?.profile?.age > 99) {
      throw new Error('Validation Error: La edad debe ser realista.');
    }
  }
}