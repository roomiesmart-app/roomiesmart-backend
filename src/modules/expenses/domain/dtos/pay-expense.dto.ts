import { IsUUID, IsNotEmpty } from 'class-validator';

export class PayExpenseDto {
  @IsUUID('4', { message: 'El ID del usuario que paga debe ser un UUID válido' })
  @IsNotEmpty()
  userId!: string;
}
