import type { ISpaceRepository } from '../ports/space.repository.js';

export class UnpublishSpaceUseCase {
  constructor(private readonly spaceRepository: ISpaceRepository) {}

  public async execute(spaceId: string, requesterId: string): Promise<void> {
    if (!spaceId) throw new Error('El ID del espacio es obligatorio.');
    if (!requesterId) throw new Error('El ID del solicitante es obligatorio.');

    const space = await this.spaceRepository.findById(spaceId);
    if (!space) throw new Error('El espacio no fue encontrado.');

    if (space.owner_id !== requesterId) {
      throw new Error('Solo el dueño de la publicación puede darla de baja.');
    }

    await this.spaceRepository.softDelete(spaceId);
  }
}
