import type { ExpenseModel } from '../../domain/expense.model.js';


export interface IExpenseRepository {
  saveExpense(expense: ExpenseModel): Promise<ExpenseModel>;
  getExpensesByDepartment(departmentId: string): Promise<ExpenseModel[]>;
}