import type { ISpaceRepository } from '../ports/space.repository.js';
import type { UpdateSpaceDto } from '../../domain/dtos/update-space.dto.js';

export class UpdateSpaceUseCase {
  constructor(private readonly spaceRepository: ISpaceRepository) {}

  public async execute(
    spaceId: string,
    requesterId: string,
    payload: UpdateSpaceDto
  ): Promise<any> {
    if (!spaceId) throw new Error('El ID del espacio es obligatorio.');
    if (!requesterId) throw new Error('El ID del solicitante es obligatorio.');

    payload.validate();

    const space = await this.spaceRepository.findById(spaceId);
    if (!space) throw new Error('El espacio no fue encontrado.');


    if (space.owner_id !== requesterId) {
      throw new Error('Solo el dueño de la publicación puede editarla.');
    }

    const patch: Record<string, any> = {};
    if (payload.cityId !== undefined) patch.city_id = payload.cityId;
    if (payload.title !== undefined) patch.title = payload.title;
    if (payload.description !== undefined) patch.description = payload.description;
    if (payload.monthlyPrice !== undefined) patch.monthly_price = payload.monthlyPrice;
    if (payload.locationAddress !== undefined) patch.location_address = payload.locationAddress;
    if (payload.neighborhood !== undefined) patch.neighborhood = payload.neighborhood;
    if (payload.spaceType !== undefined) patch.space_type = payload.spaceType;
    if (payload.commonAreas !== undefined) patch.common_areas = payload.commonAreas;
    if (payload.amenities !== undefined) patch.amenities = payload.amenities;
    if (payload.images !== undefined) patch.images = payload.images;

    if (Object.keys(patch).length === 0) {
      throw new Error('No enviaste ningún campo para actualizar.');
    }

    return await this.spaceRepository.update(spaceId, patch);
  }
}
