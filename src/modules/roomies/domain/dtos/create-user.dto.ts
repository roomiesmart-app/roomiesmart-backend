import { Type } from 'class-transformer';
import 'reflect-metadata'; // Secure the metadata API for decorators

// 1. Convert each nested object into its own DTO class
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
  @Type(() => BudgetRangeDto) // this tells class-transformer to go deeper and transform the nested object into a BudgetRangeDto instance
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

// 2. The class that represents the entire payload for user creation, which includes all the nested preferences
export class CreateUserDto {
  name!: string;
  email!: string;
  password!: string;

  @Type(() => NestedPreferencesDto) // This says that the "preferences" property should be transformed into an instance of NestedPreferencesDto, which in turn has its own nested transformations
  preferences!: NestedPreferencesDto;

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
    if (!this.preferences?.profile || this.preferences.profile.age < 17 || this.preferences.profile.age > 99) {
      throw new Error('Validation Error: La edad debe ser realista.');
    }
  }
}