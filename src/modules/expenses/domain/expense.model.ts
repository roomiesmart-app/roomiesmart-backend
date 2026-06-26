// The representation of an expense in the system, used across all layers (application, domain, infrastructure)
export interface ExpenseModel {
  id?: string;
  departmentId: string;
  payerId: string;
  amount: number;
  description: string;
  expenseDate?: Date;
  createdAt?: Date;
  
  // Optional field to hold payer details when we fetch expenses with relational consistency
  payerDetails?: {
    name?: string;
    email?: string;
  };
}