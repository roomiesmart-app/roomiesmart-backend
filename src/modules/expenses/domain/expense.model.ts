
export interface ExpenseModel {
  id?: string;
  departmentId: string;
  payerId: string;
  amount: number;
  description: string;
  // Usuarios entre quienes se divide el gasto; undefined = todos los miembros
  participants?: string[];
  expenseDate?: Date;
  createdAt?: Date;


  payerDetails?: {
    name?: string;
    email?: string;
  };
}