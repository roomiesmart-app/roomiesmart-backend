import { IsString, IsOptional, IsNumber, IsArray, Min, Max, IsBoolean } from 'class-validator';

export class ProfileDto {
  @IsString({ message: 'El ID del usuario debe ser un texto válido.' })
  userId!: string;

  @IsOptional()
  @IsArray({ message: 'Los hobbies deben ser un arreglo.' })
  @IsString({ each: true, message: 'Cada hobby debe ser texto.' })
  hobbies?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isEarlyBird debe ser verdadero o falso.' })
  isEarlyBird?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El presupuesto mínimo debe ser un número.' })
  @Min(50, { message: 'El presupuesto mínimo no puede ser menor a $50.' })
  minBudget?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El presupuesto máximo debe ser un número.' })
  @Max(2000, { message: 'El presupuesto máximo es irreal.' })
  maxBudget?: number;

  // method to validate the relationship between minBudget and maxBudget, ensuring that minBudget is not greater than maxBudget. This is a business rule that we want to enforce in addition to the individual field validations provided by class-validator.
  public validate() {
  
    if (this.minBudget && this.maxBudget && this.minBudget > this.maxBudget) {
      throw new Error('El presupuesto mínimo no puede ser mayor al máximo.');
    }
  }
}