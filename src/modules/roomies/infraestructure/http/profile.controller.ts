import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProfileDto } from '../../domain/dtos/profile.dto.js';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.js';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.js';
import { SupabaseUserAdapter } from '../adapters/supabase-user.adapter.js';
import { logger } from '../../../../core/logger.js';

export class ProfileController {
  
  // ==========================================
  // GET: Obtain profile settings for the frontend 
  // ==========================================
  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Falta el userId en la consulta.' });
        return;
      }

      // Call the Use Case to get the profile settings from Supabase
      const useCase = new GetProfileUseCase(new SupabaseUserAdapter());
      const profile = await useCase.execute(userId);

      // Return the profile settings to the frontend. The profile object will contain all the relevant settings for the user, which can be used to pre-fill forms or display the user's preferences in the UI.
      res.status(200).json(profile);

    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }

  // ==========================================
  // POST: Create or update profile settings (upsert)
  // ==========================================
  public async upsertProfile(req: Request, res: Response): Promise<void> {
    try {
      // 1. Transform the incoming JSON into a ProfileDto instance
      const dto = plainToInstance(ProfileDto, req.body);

      // 2. Execute class-validator validations based on the decorators defined in ProfileDto. If there are validation errors, we return a 400 Bad Request response with the details of the validation issues. This ensures that we only proceed with valid data and provides clear feedback to the client about what needs to be fixed.
      const errors = await validate(dto);
      if (errors.length > 0) {
        const errorMessages = errors.map(err => Object.values(err.constraints || {})).flat();
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          messages: errorMessages
        });
        return;
      }

      // 3. Execute additional manual validations (e.g., minBudget > maxBudget)
      dto.validate();

      // 4. Call the Use Case to save the validated information in Supabase
      const useCase = new UpdateProfileUseCase(new SupabaseUserAdapter());
      await useCase.execute(dto);

      res.status(201).json({ message: 'Perfil guardado correctamente en Supabase', data: dto });

    } catch (error: any) {
      logger.error(error.message);
      res.status(400).json({
        error: 'BAD_REQUEST',
        message: error.message
      });
      logger.error(error.message);
    }
  }
}