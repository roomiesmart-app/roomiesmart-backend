import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterExpenseDto } from '../../domain/dtos/register-expense.dto.js';
import { LogExpenseUseCase } from '../../application/use-cases/log-expense.js';
import type { IExpenseRepository } from '../../application/ports/expense.repository.js';
export class ExpenseController {
  
  constructor(
    private readonly logExpenseUseCase: LogExpenseUseCase,
    private readonly expenseRepository: IExpenseRepository 
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
}