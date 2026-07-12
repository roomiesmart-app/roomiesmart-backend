import { supabase } from '../../../../core/database.js';
import type { IExpenseRepository } from '../../application/ports/expense.repository.js';
import type { ExpenseModel, ExpensePayment } from '../../domain/expense.model.js';

const mapPayments = (rows: any[] | null | undefined): ExpensePayment[] =>
  (rows ?? []).map((p: any) => ({
    userId: p.user_id,
    amount: p.amount,
    paidAt: p.paid_at
  }));

export class SupabaseExpenseAdapter implements IExpenseRepository {

  public async saveExpense(expense: ExpenseModel): Promise<ExpenseModel> {
    const { data, error } = await supabase
      .from('department_expenses')
      .insert({
        department_id: expense.departmentId,
        payer_id: expense.payerId,
        amount: expense.amount,
        description: expense.description,
        participants: expense.participants ?? null
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
      participants: data.participants ?? undefined,
      expenseDate: data.expense_date
    };
  }

  public async getExpensesByDepartment(departmentId: string): Promise<ExpenseModel[]> {
    const { data, error } = await supabase
      .from('department_expenses')
      .select(`
        id,
        department_id,
        payer_id,
        amount,
        description,
        participants,
        expense_date,
        users!department_expenses_payer_id_fkey (
          id,
          email
        ),
        expense_payments (
          user_id,
          amount,
          paid_at
        )
      `)
      .eq('department_id', departmentId)
      .order('expense_date', { ascending: false });

    if (error) throw new Error(`Error en BD al leer gastos: ${error.message}`);

    return (data ?? []).map((row: any) => ({
      id: row.id,
      departmentId: row.department_id,
      payerId: row.payer_id,
      amount: row.amount,
      description: row.description,
      participants: row.participants ?? undefined,
      payments: mapPayments(row.expense_payments),
      expenseDate: row.expense_date,
      payerDetails: row.users
    }));
  }

  public async getExpenseById(expenseId: string): Promise<ExpenseModel | null> {
    const { data, error } = await supabase
      .from('department_expenses')
      .select(`
        id,
        department_id,
        payer_id,
        amount,
        description,
        participants,
        expense_date,
        expense_payments (
          user_id,
          amount,
          paid_at
        )
      `)
      .eq('id', expenseId)
      .maybeSingle();

    if (error) throw new Error(`Error en BD al leer gasto: ${error.message}`);
    if (!data) return null;

    return {
      id: data.id,
      departmentId: data.department_id,
      payerId: data.payer_id,
      amount: data.amount,
      description: data.description,
      participants: data.participants ?? undefined,
      payments: mapPayments(data.expense_payments),
      expenseDate: data.expense_date
    };
  }

  public async registerPayment(
    expenseId: string,
    userId: string,
    amount: number | null
  ): Promise<ExpensePayment> {
    const { data, error } = await supabase
      .from('expense_payments')
      .upsert(
        { expense_id: expenseId, user_id: userId, amount },
        { onConflict: 'expense_id,user_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw new Error(`Error en BD al registrar pago: ${error.message}`);

    return {
      userId: data.user_id,
      amount: data.amount,
      paidAt: data.paid_at
    };
  }
}