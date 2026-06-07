import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer'; 
import { RegisterUserUseCase } from '../../application/use-cases/register-user.js';
import { SupabaseUserAdapter } from '../adapters/supabase-user.adapter.js';
import { CreateUserDto } from '../../domain/dtos/create-user.dto.js'; 
import { LoginUserUseCase } from '../../application/use-cases/login-user.js'; 
import { LoginUserDto } from '../../domain/dtos/login-user.dto.js' 

export class RoomieController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      // Convert the incoming request body to an instance of CreateUserDto using class-transformer Postman
      
      const dto = plainToInstance(CreateUserDto, req.body);

      // Inject the repository adapter into the use case and execute it
      const useCase = new RegisterUserUseCase(new SupabaseUserAdapter());
      const newUser = await useCase.execute(dto);

      res.status(201).json(newUser);
      
    } catch (error: any) {
      // If the error is a validation error, we can return a 400 status code with the error message
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.message
      });
    }
  }



  public async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(LoginUserDto, req.body);
      const useCase = new LoginUserUseCase(new SupabaseUserAdapter());
      
      const response = await useCase.execute(dto);

      res.status(200).json(response);
    } catch (error: any) {
      const status = error.message.includes('Auth Error') ? 401 : 400;
      res.status(status).json({
        error: status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST',
        message: error.message
      });
    }
  }
}
