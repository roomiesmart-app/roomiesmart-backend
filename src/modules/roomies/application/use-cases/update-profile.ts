import type { IUserRepository } from '../ports/user.repository.js';
import type { ProfileDto } from '../../domain/dtos/profile.dto.js';

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: ProfileDto): Promise<void> {

    await this.userRepository.updateProfileSettings(dto.userId, dto);
  }
}