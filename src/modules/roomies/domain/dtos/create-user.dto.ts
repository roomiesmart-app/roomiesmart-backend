import { Type } from 'class-transformer';
import 'reflect-metadata'; 

export class UserProfileDto {
  age!: number;
  gender!: string;
  career!: string;
  semester!: string;
  birthCity!: string;
}

export class LifestylePreferencesDto {
  cleaningFrequency!: 'diaria' | '2-3 veces' | 'semanal';
  isEarlyBird!: boolean;
  useCommonAreasAtNight!: boolean;
  sharedTasks!: string[];
}

export class SocialPreferencesDto {
  hobbies!: string[];
  musicGenres!: string[];
  petPreference!: 'tengo' | 'no-molestan' | 'no-tengo';
  smokingPreference!: 'fumo' | 'no-fumo' | 'no-tolero';
  socialLevel!: 'no-social' | 'dependiendo' | 'muy-social';
}

export class BudgetRangeDto {
  min!: number;
  max!: number;
}

export class FinancialPreferencesDto {
  @Type(() => BudgetRangeDto) 
  budgetRange!: BudgetRangeDto;
  
  roomType!: 'privada' | 'compartida';
  preferredCommonAreas!: string[];
  expenseManagement!: 'fondo-comun' | 'division-digital' | 'individual';
  sharedItems!: string[];
}

export class NestedPreferencesDto {
  @Type(() => UserProfileDto)
  profile!: UserProfileDto;

  @Type(() => LifestylePreferencesDto)
  lifestyle!: LifestylePreferencesDto;

  @Type(() => SocialPreferencesDto)
  social!: SocialPreferencesDto;

  @Type(() => FinancialPreferencesDto)
  financial!: FinancialPreferencesDto;
}

export class CreateUserDto {
  name!: string;
  email!: string;
  
  // 🔥 BLINDAJE 1: Ahora es opcional para soportar Kinde SSO
  password?: string;

  @Type(() => NestedPreferencesDto) 
  preferences!: NestedPreferencesDto;

  public validate(): void {
    this.validatePassword();
    this.validateProfile();
  }

  private validatePassword(): void {
    // 🔥 BLINDAJE 2: Si viene vacía (SSO Kinde), nos saltamos el test de símbolos
    if (!this.password || this.password.trim() === '') {
      return; 
    }

    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      throw new Error('Validation Error: La contraseña debe tener al menos 8 caracteres y un símbolo especial.');
    }
  }

  private validateProfile(): void {
    if (!this.preferences?.profile || this.preferences.profile.age < 17 || this.preferences.profile.age > 99) {
      throw new Error('Validation Error: La edad debe ser realista.');
    }
  }
}