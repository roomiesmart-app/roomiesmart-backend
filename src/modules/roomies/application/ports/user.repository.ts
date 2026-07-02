import type { MatchmakingCardDto } from '../../domain/dtos/matchmaking-card.dto.js';
import { User } from '../../domain/user.model.js';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>; // <--- SOLO SE DEJA ESTA
  getProfilesForMatchmaking(): Promise<MatchmakingCardDto[]>;
  getProfileSettings(userId: string): Promise<any>;
  updateProfileSettings(userId: string, data: any): Promise<void>;
  saveOnboardingUser(dto: any): Promise<any>;
}