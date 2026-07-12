import { Router } from 'express';
import { ExpenseController } from './expense.controller.js';
import { SupabaseExpenseAdapter } from '../adapters/supabase-expense.adapter.js';
import { LogExpenseUseCase } from '../../application/use-cases/log-expense.js';
import { PayExpenseShareUseCase } from '../../application/use-cases/pay-expense-share.js';
import { SendDebtReminderUseCase } from '../../application/use-cases/send-debt-reminder.js';
import { NodemailerEmailAdapter } from '../../../roomies/infraestructure/adapters/nodemailer-email.adapter.js';

const router = Router();

const adapter = new SupabaseExpenseAdapter();
const emailAdapter = new NodemailerEmailAdapter();
const logUseCase = new LogExpenseUseCase(adapter);
const payUseCase = new PayExpenseShareUseCase(adapter);
const reminderUseCase = new SendDebtReminderUseCase(emailAdapter);
const controller = new ExpenseController(logUseCase, adapter, payUseCase, reminderUseCase);

router.post('/', controller.registerExpense.bind(controller));
router.post('/reminders', controller.sendReminder.bind(controller));
router.post('/:expenseId/payments', controller.payShare.bind(controller));
router.get('/:departmentId', controller.getExpenses.bind(controller));

export default router;
