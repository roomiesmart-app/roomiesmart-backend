import type { IEmailService } from '../../../roomies/application/ports/email.service.js';
import { SendReminderDto } from '../../domain/dtos/send-reminder.dto.js';

export class SendDebtReminderUseCase {
  constructor(private readonly emailService: IEmailService) {}

  public async execute(dto: SendReminderDto): Promise<void> {
    const detail = dto.items?.length
      ? `<br/><br/>Detalle de la deuda:<br/>• ${dto.items.join('<br/>• ')}`
      : '';

    const subject = 'Recordatorio de pago pendiente 💰';
    const message =
      `${dto.creditorName} te recuerda que tienes una deuda pendiente de ` +
      `<strong>$${dto.amount.toFixed(2)}</strong> por gastos compartidos del departamento.` +
      `${detail}<br/><br/>Puedes marcar tu parte como pagada desde la sección Finanzas.`;

    await this.emailService.sendToUser(dto.debtorId, subject, message);
  }
}
