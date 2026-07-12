import type { ISpaceRepository } from '../ports/space.repository.js';
import type { PublishSpaceDto } from '../../domain/dtos/publish-space.dto.js';

export class PublishSpaceUseCase {
  constructor(private readonly spaceRepository: ISpaceRepository) {}

  public async execute(ownerId: string, payload: PublishSpaceDto): Promise<any> {
    if (!ownerId) throw new Error('El ID del dueño es obligatorio.');

    payload.validate();

    const newSpace = {
      owner_id: ownerId,
      city_id: payload.cityId,
      title: payload.title,
      description: payload.description || '',
      monthly_price: payload.monthlyPrice,
      location_address: payload.locationAddress,
      neighborhood: payload.neighborhood,
      space_type: payload.spaceType,
      common_areas: payload.commonAreas,
      amenities: payload.amenities,
      images: payload.images,
      is_available: true
    };

    try {
      return await this.spaceRepository.create(newSpace);
    } catch (error) {

      console.error('🚨 Error crítico publicando (UseCase):', error);
      console.error('Payload que falló:', JSON.stringify(newSpace, null, 2));
      throw error;
    }
  }
}
