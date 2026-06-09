import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer'; 
import { RegisterUserUseCase } from '../../application/use-cases/register-user.js';
import { SupabaseUserAdapter } from '../adapters/supabase-user.adapter.js';
import { CreateUserDto } from '../../domain/dtos/create-user.dto.js'; 
import { LoginUserUseCase } from '../../application/use-cases/login-user.js'; 
import { LoginUserDto } from '../../domain/dtos/login-user.dto.js'; 

export class RoomieController {
  public async register(req: Request, res: Response): Promise<void> {
    
    try {
      // 1. Instance the DTO without using plainToInstance because we have a complex nested structure that doesn't fit well with the plainToInstance approach, which is more suitable for flat JSON objects. Instead, we will manually assign the properties to ensure that the nested objects are properly constructed.
      const dto = new CreateUserDto();

      // 2. Inyect the request body directly into the DTO instance. This way we can leverage the class-validator decorators for validation, and we can also handle the nested structure more easily.
      Object.assign(dto, req.body);

      // 3. Validate the DTO. This will throw an error if any of the validation rules defined in the DTO are violated, which we can catch and return as a response with a 400 status code.
      dto.validate();

      // Inject the repository dependency into the use case and execute it
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
      // For the login, we can use plainToInstance because the structure is flat and simple, which allows us to easily transform the incoming JSON into an instance of LoginUserDto and validate it.
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