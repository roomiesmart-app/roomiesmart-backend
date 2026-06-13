import type { IUserRepository } from '../ports/user.repository.js';
import type { MatchmakingCardDto } from '../../domain/dtos/matchmaking-card.dto.js';

export class GetMatchmakingProfilesUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(): Promise<MatchmakingCardDto[]> {
    
    return await this.userRepository.getProfilesForMatchmaking();
  }
}