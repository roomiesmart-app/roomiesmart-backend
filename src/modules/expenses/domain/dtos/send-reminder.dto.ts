import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class SendReminderDto {
  @IsUUID('4', { message: 'El ID del deudor debe ser un UUID válido' })
  @IsNotEmpty()
  debtorId!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de quien recuerda es obligatorio' })
  creditorName!: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe tener máximo 2 decimales' })
  @Min(0.01, { message: 'El monto adeudado debe ser mayor a 0' })
  amount!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items?: string[];
}
