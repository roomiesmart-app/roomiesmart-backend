import type { IExpenseRepository } from '../ports/expense.repository.js';
import type { ExpensePayment } from '../../domain/expense.model.js';

export class PayExpenseShareUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  public async execute(expenseId: string, userId: string): Promise<ExpensePayment> {
    const expense = await this.expenseRepository.getExpenseById(expenseId);
    if (!expense) throw new Error('El gasto no existe.');

    if (expense.payerId === userId) {
      throw new Error('El pagador original no debe registrar un pago: él ya puso el dinero.');
    }

    if (expense.participants?.length && !expense.participants.includes(userId)) {
      throw new Error('El usuario no participa en este gasto.');
    }

    // En gastos legados (sin lista de participantes) no se puede calcular la parte exacta
    const shareAmount = expense.participants?.length
      ? Number((expense.amount / expense.participants.length).toFixed(2))
      : null;

    return await this.expenseRepository.registerPayment(expenseId, userId, shareAmount);
  }
}
