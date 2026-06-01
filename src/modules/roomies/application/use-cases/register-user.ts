import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../domain/dtos/create-user.dto.js';
import { User } from '../../domain/user.model.js';
import type { IUserRepository } from '../ports/user.repository.js';

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(data: any) {
    const dto = new CreateUserDto();
    
    // Basic mapping of flat fields
    dto.name = data.name;
    dto.email = data.email;
    dto.password = data.password;
    
    // Mapping of nested preferences, assurance of defaults if some fields are missing
    dto.preferences = {
      profile: {
        age: Number(data.age) || 0,
        gender: data.gender || '',
        career: data.career || '',
        semester: data.semester || '',
        birthCity: data.birthCity || '',
      },
      // Initialize lifestyle, social, and financial with either provided data or sensible defaults
      lifestyle: data.lifestyle || { cleaningFrequency: 'semanal', isEarlyBird: false, useCommonAreasAtNight: false, sharedTasks: [] },
      social: data.social || { hobbies: [], musicGenres: [], petPreference: 'no-tengo', smokingPreference: 'no-fumo', socialLevel: 'dependiendo' },
      financial: data.financial || { budgetRange: { min: 0, max: 0 }, roomType: 'compartida', preferredCommonAreas: [], expenseManagement: 'division-digital', sharedItems: [] }
    };

    // 3. Validations
    dto.validate(); // Call the validate method to ensure all fields are correct before proceeding

    // 4. Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 5. Create the User entity using the factory method, passing the hashed password and structured preferences
    const user = User.create(dto.name, dto.email, hashedPassword, dto.preferences);

    // 6. Persist the user using the repository
    await this.userRepository.save(user);

    return { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      createdAt: user.created_at 
    };
  }
}