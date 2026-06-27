import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../domain/dtos/create-user.dto.js';
import { User } from '../../domain/user.model.js';
import type { IUserRepository } from '../ports/user.repository.js';

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(dto: CreateUserDto) {
    let hashedPassword = 'SSO_KINDE_FEDERATED_USER';

    // 🔥 BLINDAJE 3: Solo encriptamos si el usuario escribió una contraseña manual
    if (dto.password && dto.password.trim() !== '') {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(dto.password, saltRounds);
    }

    const user = User.create(
      dto.name, 
      dto.email, 
      hashedPassword, 
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