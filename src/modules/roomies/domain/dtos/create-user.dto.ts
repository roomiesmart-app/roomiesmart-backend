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
  password?: string; // <--- Recibe el "" del Front y lo manda al vacío

  @Type(() => NestedPreferencesDto) 
  preferences!: NestedPreferencesDto;

  public validate(): void {
    // ¡ADIÓS VALIDATE PASSWORD!
    this.validateProfile();
  }

  private validateProfile(): void {
    if (!this.preferences?.profile || this.preferences.profile.age < 17 || this.preferences.profile.age > 99) {
      throw new Error('Validation Error: La edad debe ser realista.');
    }
  }
}