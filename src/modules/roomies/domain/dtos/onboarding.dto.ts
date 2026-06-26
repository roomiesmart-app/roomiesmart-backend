import { Type } from 'class-transformer';
import { IsString, IsInt, IsEmail, Min, Max, ValidateNested, validateSync } from 'class-validator';

export class OnboardingIdentityDto {
  @IsEmail({}, { message: 'El formato del email es inválido' })
  email!: string;

  @IsString()
  externalId!: string;
}

export class OnboardingProfileDto {
  @IsString()
  fullName!: string;

  @IsInt()
  @Min(17, { message: 'Debes ser mayor de 17 años' })
  @Max(99)
  age!: number;

  @IsString()
  gender!: string;

  @IsString()
  birthCity!: string;

  @IsString()
  career!: string;

  @IsInt()
  currentSemester!: number;
}

export class OnboardingRequestDto {
  @ValidateNested()
  @Type(() => OnboardingIdentityDto)
  identity!: OnboardingIdentityDto;

  @ValidateNested()
  @Type(() => OnboardingProfileDto)
  profile!: OnboardingProfileDto;

  public validate(): void {
    const errors = validateSync(this);
    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      throw new Error(`Validation Error: ${messages.join(', ')}`);
    }
  }
}