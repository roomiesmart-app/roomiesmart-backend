import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterExpenseDto } from '../../domain/dtos/register-expense.dto.js';
import { PayExpenseDto } from '../../domain/dtos/pay-expense.dto.js';
import { SendReminderDto } from '../../domain/dtos/send-reminder.dto.js';
import { LogExpenseUseCase } from '../../application/use-cases/log-expense.js';
import { PayExpenseShareUseCase } from '../../application/use-cases/pay-expense-share.js';
import { SendDebtReminderUseCase } from '../../application/use-cases/send-debt-reminder.js';
import type { IExpenseRepository } from '../../application/ports/expense.repository.js';

export class ExpenseController {

  constructor(
    private readonly logExpenseUseCase: LogExpenseUseCase,
    private readonly expenseRepository: IExpenseRepository,
    private readonly payExpenseShareUseCase: PayExpenseShareUseCase,
    private readonly sendDebtReminderUseCase: SendDebtReminderUseCase
  ) {}

  public async registerExpense(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(RegisterExpenseDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({ error: 'BAD_REQUEST', details: errors });
        return;
      }

      const result = await this.logExpenseUseCase.execute(dto);
      res.status(201).json({ message: 'Gasto registrado', data: result });

    } catch (error: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    }
  }

  public async getExpenses(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.departmentId;
      const departmentId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!departmentId) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Falta departmentId' });
        return;
      }

      const expenses = await this.expenseRepository.getExpensesByDepartment(departmentId);
      res.status(200).json({ data: expenses });
    } catch (error: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    }
  }

  public async payShare(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.expenseId;
      const expenseId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!expenseId) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Falta expenseId' });
        return;
      }

      const dto = plainToInstance(PayExpenseDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({ error: 'BAD_REQUEST', details: errors });
        return;
      }

      const payment = await this.payExpenseShareUseCase.execute(expenseId, dto.userId);
      res.status(201).json({ message: 'Pago registrado', data: payment });

    } catch (error: any) {
      const known =
        error.message?.includes('no existe') ||
        error.message?.includes('no participa') ||
        error.message?.includes('pagador original');
      res
        .status(known ? 400 : 500)
        .json({ error: known ? 'BAD_REQUEST' : 'INTERNAL_ERROR', message: error.message });
    }
  }

  public async sendReminder(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(SendReminderDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({ error: 'BAD_REQUEST', details: errors });
        return;
      }

      await this.sendDebtReminderUseCase.execute(dto);
      res.status(200).json({ message: 'Recordatorio enviado' });

    } catch (error: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    }
  }
}
