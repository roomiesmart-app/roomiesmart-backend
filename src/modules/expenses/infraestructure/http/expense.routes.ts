import { Router } from 'express';
import { ExpenseController } from './expense.controller.js';
import { SupabaseExpenseAdapter } from '../adapters/supabase-expense.adapter.js';
import { LogExpenseUseCase } from '../../application/use-cases/log-expense.js';

const router = Router();

const adapter = new SupabaseExpenseAdapter();
const logUseCase = new LogExpenseUseCase(adapter);
const controller = new ExpenseController(logUseCase, adapter);

router.post('/', controller.registerExpense.bind(controller));
router.get('/:departmentId', controller.getExpenses.bind(controller));

export default router;