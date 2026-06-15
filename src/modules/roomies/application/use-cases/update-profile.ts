import type { IUserRepository } from '../ports/user.repository.js';
import type { ProfileDto } from '../../domain/dtos/profile.dto.js';

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: ProfileDto): Promise<void> {
    // Here we can add any additional business logic or transformations if needed before saving the profile settings. For example, we could enforce certain rules about the hobbies (e.g., no duplicates) or validate that the budget range is reasonable. However, since we've already done validation in the controller, we can assume that the data is clean at this point and just pass it to the repository to handle the database updates.
    await this.userRepository.updateProfileSettings(dto.userId, dto);
  }
}