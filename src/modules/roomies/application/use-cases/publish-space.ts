import type { ISpaceRepository } from '../ports/space.repository.js';

export class PublishSpaceUseCase {
  constructor(private readonly spaceRepository: ISpaceRepository) {}

  public async execute(ownerId: string, payload: any): Promise<any> {
    if (!ownerId) throw new Error('El ID del dueño es obligatorio.');
    
    if (!payload.title || !payload.monthlyPrice || !payload.locationAddress) {
      throw new Error('Faltan campos obligatorios (título, precio o dirección).');
    }

   
    if (!payload.images || !Array.isArray(payload.images) || payload.images.length < 5) {
      throw new Error('Debes subir al menos 5 fotos de tu departamento.');
    }

    const newSpace = {
      owner_id: ownerId,
      city_id: payload.cityId || null,
      title: payload.title,
      description: payload.description || '',
      monthly_price: payload.monthlyPrice,
      location_address: payload.locationAddress,
      images: payload.images,
      is_available: true
    };

    return await this.spaceRepository.create(newSpace);
  }
}