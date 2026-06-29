import { Router } from 'express';
import { ExpenseController } from './expense.controller.js';
import { SupabaseExpenseAdapter } from '../adapters/supabase-expense.adapter.js';
import { LogExpenseUseCase } from '../../application/use-cases/log-expense.js';

const router = Router();

// Inyección de dependencias manual
const adapter = new SupabaseExpenseAdapter();
const logUseCase = new LogExpenseUseCase(adapter);
const controller = new ExpenseController(logUseCase, adapter);

// Definimos los Endpoints
router.post('/', controller.registerExpense.bind(controller));
router.get('/:departmentId', controller.getExpenses.bind(controller));

export default router;