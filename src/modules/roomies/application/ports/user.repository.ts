import { User } from '../../domain/user.model.js';

export interface IUserRepository {
  save(user: User): Promise<void>;
}