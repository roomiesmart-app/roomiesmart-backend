import { RegisterExpenseDto } from '../../domain/dtos/register-expense.dto.js';
import type { IExpenseRepository } from '../ports/expense.repository.js';
import type { ExpenseModel } from '../../domain/expense.model.js';

export class LogExpenseUseCase {
  // Dependencies inyection for the repository (adapter)
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  public async execute(dto: RegisterExpenseDto): Promise<ExpenseModel> {
    
    
    return await this.expenseRepository.saveExpense({
      departmentId: dto.departmentId,
      payerId: dto.payerId,
      amount: dto.amount,
      description: dto.description
    });
  }
}