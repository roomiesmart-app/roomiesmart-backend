import type { ISpaceRepository } from '../ports/space.repository.js';

export class ListUserDepartmentsUseCase {
  constructor(private readonly spaceRepository: ISpaceRepository) {}

  public async execute(userId: string): Promise<any[]> {
    if (!userId) throw new Error('El ID del usuario es obligatorio.');
    return await this.spaceRepository.findByUser(userId);
  }
}
