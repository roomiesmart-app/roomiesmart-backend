import { supabase } from '../../../../core/database.js'; 
import type { IExpenseRepository } from '../../application/ports/expense.repository.js';
import type { ExpenseModel } from '../../domain/expense.model.js';

export class SupabaseExpenseAdapter implements IExpenseRepository {
  
  // ==========================================
  // Create 
  // ==========================================
  public async saveExpense(expense: ExpenseModel): Promise<ExpenseModel> {
    const { data, error } = await supabase
      .from('department_expenses')
      .insert({
        department_id: expense.departmentId,
        payer_id: expense.payerId,
        amount: expense.amount,
        description: expense.description
      })
      .select()
      .single();

    if (error) throw new Error(`Error en BD al guardar gasto: ${error.message}`);

    return {
      id: data.id,
      departmentId: data.department_id,
      payerId: data.payer_id,
      amount: data.amount,
      description: data.description,
      expenseDate: data.expense_date
    };
  }

  // ==========================================
  // Read (con consistencia relacional)
  // ==========================================
  public async getExpensesByDepartment(departmentId: string): Promise<ExpenseModel[]> {
    // Here we use Supabase's ability to fetch related data in one query (the payer's email from the users table)
    const { data, error } = await supabase
      .from('department_expenses')
      .select(`
        id,
        department_id,
        payer_id,
        amount,
        description,
        expense_date,
        users!department_expenses_payer_id_fkey (
          id,
          email
        )
      `)
      .eq('department_id', departmentId)
      .order('expense_date', { ascending: false });

    if (error) throw new Error(`Error en BD al leer gastos: ${error.message}`);

    // Mapped to our ExpenseModel, including the payer's email from the related users table
    return data.map((row: any) => ({
      id: row.id,
      departmentId: row.department_id,
      payerId: row.payer_id,
      amount: row.amount,
      description: row.description,
      expenseDate: row.expense_date,
      payerDetails: row.users // email or name if you want to fetch more details in the future
    }));
  }
}