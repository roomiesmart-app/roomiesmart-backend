import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProfileDto } from '../../domain/dtos/profile.dto.js';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.js';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.js';
import { SupabaseUserAdapter } from '../adapters/supabase-user.adapter.js';
import { logger } from '../../../../core/logger.js';

export class ProfileController {




  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Falta el userId en la consulta.' });
        return;
      }


      const useCase = new GetProfileUseCase(new SupabaseUserAdapter());
      const profile = await useCase.execute(userId);


      res.status(200).json(profile);

    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }




  public async upsertProfile(req: Request, res: Response): Promise<void> {
    try {

      const dto = plainToInstance(ProfileDto, req.body);


      const errors = await validate(dto);
      if (errors.length > 0) {
        const errorMessages = errors.map(err => Object.values(err.constraints || {})).flat();
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          messages: errorMessages
        });
        return;
      }


      dto.validate();


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