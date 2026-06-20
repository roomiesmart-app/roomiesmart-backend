import type { ExpenseModel } from '../../domain/expense.model.js';

// Contract that defines how la capa de aplicación interactúa con la capa de infraestructura (BD)
export interface IExpenseRepository {
  saveExpense(expense: ExpenseModel): Promise<ExpenseModel>;
  getExpensesByDepartment(departmentId: string): Promise<ExpenseModel[]>;
}