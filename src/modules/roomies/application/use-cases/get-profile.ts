import type { IUserRepository } from '../ports/user.repository.js';

export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(userId: string): Promise<any> {
    return await this.userRepository.getProfileSettings(userId);
  }
}