import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer'; 
import { RegisterUserUseCase } from '../../application/use-cases/register-user.js';
import { SupabaseUserAdapter } from '../adapters/supabase-user.adapter.js';
import { CreateUserDto } from '../../domain/dtos/create-user.dto.js'; 
import { LoginUserUseCase } from '../../application/use-cases/login-user.js'; 
import { LoginUserDto } from '../../domain/dtos/login-user.dto.js'; 
import { logger } from '../../../../core/logger.js';

// 🔥 IMPORTAMOS EL NUEVO CASO DE USO Y EL ADAPTADOR DE IA
import { CalculateCompatibilityUseCase } from '../../application/use-cases/calculate-compatibility.js';
import { GroqAiAdapter } from '../adapters/groq-ai.controller.js'; 

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
      logger.error(error.message);
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
      logger.error(error.message);
      const status = error.message.includes('Auth Error') ? 401 : 400;
      res.status(status).json({
        error: status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST',
        message: error.message
      });
    }
  }

  public async getMatchmakingCards(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extract the current user's ID from the query parameters. This is necessary because we need to know who the "Usuario Principal" is in order to calculate compatibility with the other candidates. In a real application, you would typically get this from the authentication token or session, but for simplicity, we're passing it as a query parameter in this example.
      const currentUserId = req.query.userId as string;

      if (!currentUserId) {
        res.status(400).json({ 
          error: 'BAD_REQUEST', 
          message: 'Falta el userId en la URL. Ejemplo: /api/v1/identity/matchmaking-profiles?userId=uuid-del-usuario' 
        });
        return;
      }

      // 2. On the backend, we need to execute the compatibility calculation logic, which involves fetching all user profiles, separating the current user from the candidates, and then passing that data to the AI service to get compatibility scores. We will instantiate the CalculateCompatibilityUseCase here and execute it with the current user's ID.
      const useCase = new CalculateCompatibilityUseCase(
        new SupabaseUserAdapter(),
        new GroqAiAdapter()
      );

      // 3. Execute the use case to get the ranked matches based on compatibility scores calculated by the AI. This will return an array of candidate profiles with their respective compatibility scores and reasons for the match, which we can then return to the frontend.
      const matches = await useCase.execute(currentUserId);

      // 4. Return the matches as a JSON response to the frontend, which can then display them in the UI. Each match will include the candidate's profile information along with the compatibility score and reason provided by the AI.
      res.status(200).json(matches);

    } catch (error: any) {
      console.error("Error en Matchmaking:", error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message
      });
    }
  }
}