import type { MatchmakingCardDto } from '../../domain/dtos/matchmaking-card.dto.js';
import { User } from '../../domain/user.model.js';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  getProfilesForMatchmaking(): Promise<MatchmakingCardDto[]>;
}