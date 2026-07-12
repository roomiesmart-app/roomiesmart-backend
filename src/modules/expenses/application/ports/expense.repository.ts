import type { ExpenseModel, ExpensePayment } from '../../domain/expense.model.js';


export interface IExpenseRepository {
  saveExpense(expense: ExpenseModel): Promise<ExpenseModel>;
  getExpensesByDepartment(departmentId: string): Promise<ExpenseModel[]>;
  getExpenseById(expenseId: string): Promise<ExpenseModel | null>;
  registerPayment(
    expenseId: string,
    userId: string,
    amount: number | null
  ): Promise<ExpensePayment>;
}