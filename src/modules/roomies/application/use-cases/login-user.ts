import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginUserDto } from '../../domain/dtos/login-user.dto.js';
import type { IUserRepository } from '../ports/user.repository.js';
import { logger } from '../../../../core/logger.js';

export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(dto: LoginUserDto) {
    dto.validate();

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      logger.error('Auth Error: Credenciales inválidas.');
      throw new Error('Auth Error: Credenciales inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      logger.error('Auth Error: Credenciales inválidas.');
      throw new Error('Auth Error: Credenciales inválidas.');
    }

    // Sign JWT token
    const secretKey = process.env.JWT_SECRET || 'firma_secreta_para_desarrollo_roomiesmart';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secretKey,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, name: user.name, email: user.email },
      token: token
    };
  }
}