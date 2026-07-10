import type { IMembershipRepository } from '../ports/membership.repository.js';
import type { ISpaceRepository } from '../ports/space.repository.js';
import type { INotificationRepository } from '../ports/notification.repository.js';
import type { CreateSpaceRequestDto } from '../../domain/dtos/space-request.dto.js';

export class RequestToJoinUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly spaceRepository: ISpaceRepository,
    private readonly notificationRepository: INotificationRepository
  ) {}

  public async execute(spaceId: string, payload: CreateSpaceRequestDto): Promise<any> {
    if (!spaceId) throw new Error('El ID del espacio es obligatorio.');
    payload.validate();

    const space = await this.spaceRepository.findById(spaceId);
    if (!space) throw new Error('El espacio no fue encontrado.');

    if (space.owner_id === payload.requesterId) {
      throw new Error('No puedes solicitar unirte a tu propio espacio.');
    }


    const alreadyMember = await this.membershipRepository.isMember(
      spaceId,
      payload.requesterId
    );
    if (alreadyMember) {
      throw new Error('Ya eres miembro de este departamento.');
    }

    const request = await this.membershipRepository.createRequest(
      spaceId,
      payload.requesterId,
      payload.message
    );

    await this.notificationRepository.create({
      userId: space.owner_id,
      type: 'join_request',
      title: 'Nueva solicitud de unión',
      body: `Alguien quiere unirse a "${space.title}".`,
      resourceId: request.id
    });

    return request;
  }
}
