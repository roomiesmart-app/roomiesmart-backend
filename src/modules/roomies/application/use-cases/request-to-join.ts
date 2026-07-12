import type { IMembershipRepository } from '../ports/membership.repository.js';
import type { ISpaceRepository } from '../ports/space.repository.js';
import type { INotificationRepository } from '../ports/notification.repository.js';
import type { IEmailService } from '../ports/email.service.js';

export interface RequestToJoinPayload {
  requesterId: string;
  message?: string;
  validate(): void;
}

export class RequestToJoinUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly spaceRepository: ISpaceRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly emailService: IEmailService
  ) {}

  public async execute(spaceId: string, payload: RequestToJoinPayload): Promise<any> {
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
    await this.emailService.sendToUser(
      space.owner_id,
      'Nueva solicitud de unión a tu espacio',
      `Alguien quiere unirse a "${space.title}". Entra a RoomieSmart para aceptar o rechazar la solicitud.`
    );

    return request;
  }
}
