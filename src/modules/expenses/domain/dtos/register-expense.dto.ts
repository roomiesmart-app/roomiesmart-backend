import {
  IsUUID,
  IsNumber,
  IsString,
  Min,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class RegisterExpenseDto {
  @IsUUID('4', { message: 'El ID del departamento debe ser un UUID válido' })
  @IsNotEmpty()
  departmentId!: string;

  @IsUUID('4', { message: 'El ID del usuario (pagador) debe ser un UUID válido' })
  @IsNotEmpty()
  payerId!: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe tener máximo 2 decimales' })
  @Min(0.01, { message: 'El monto del gasto debe ser mayor a 0' })
  amount!: number;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @IsOptional()
  @IsArray({ message: 'Los participantes deben ser una lista de IDs' })
  @ArrayMinSize(1, { message: 'Debe haber al menos un participante' })
  @IsUUID('4', { each: true, message: 'Cada participante debe ser un UUID válido' })
  participants?: string[];
}