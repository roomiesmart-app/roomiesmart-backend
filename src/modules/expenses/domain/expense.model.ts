
export interface ExpensePayment {
  userId: string;
  amount: number | null;
  paidAt: string;
}

export interface ExpenseModel {
  id?: string;
  departmentId: string;
  payerId: string;
  amount: number;
  description: string;
  // Usuarios entre quienes se divide el gasto; undefined = todos los miembros
  participants?: string[];
  // Participantes que ya pagaron su parte al pagador
  payments?: ExpensePayment[];
  expenseDate?: Date;
  createdAt?: Date;


  payerDetails?: {
    name?: string;
    email?: string;
  };
}