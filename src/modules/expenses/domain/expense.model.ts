
export interface ExpenseModel {
  id?: string;
  departmentId: string;
  payerId: string;
  amount: number;
  description: string;
  expenseDate?: Date;
  createdAt?: Date;


  payerDetails?: {
    name?: string;
    email?: string;
  };
}