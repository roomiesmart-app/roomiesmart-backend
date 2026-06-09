import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../domain/dtos/create-user.dto.js';
import { User } from '../../domain/user.model.js';
import type { IUserRepository } from '../ports/user.repository.js';

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  // DTO validateion is done in the controller, so we can assume that the DTO is already valid when it reaches this point
  public async execute(dto: CreateUserDto) {
    
    // 1. Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 2. Create the User entity using the factory method, 
    // passing the hashed password and the perfectly structured preferences
    const user = User.create(
      dto.name, 
      dto.email, 
      hashedPassword, 
      dto.preferences
    );

    // 3. Persist the user using the repository
    await this.userRepository.save(user);

    // 4. Return the created user (without the password) 
    return { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      createdAt: user.created_at 
    };
  }
}