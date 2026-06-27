import { CreateUserDto } from '../../domain/dtos/create-user.dto.js';
import { User } from '../../domain/user.model.js';
import type { IUserRepository } from '../ports/user.repository.js';

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(dto: CreateUserDto) {
    
    // Como Kinde ya hizo la autenticación biométrica/institucional, 
    // PostgreSQL solo necesita un texto fijo en la columna password_hash
    const user = User.create(
      dto.name, 
      dto.email, 
      'SSO_KINDE_FEDERATED_USER', 
      dto.preferences
    );

    await this.userRepository.save(user);

    return { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      createdAt: user.created_at 
    };
  }
}