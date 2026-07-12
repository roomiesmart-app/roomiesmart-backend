import type { IMembershipRepository } from '../ports/membership.repository.js';
import type { ISpaceRepository } from '../ports/space.repository.js';
import type { INotificationRepository } from '../ports/notification.repository.js';
import type { IEmailService } from '../ports/email.service.js';

export interface ResolveRequestPayload {
  resolverId: string;
  action: 'accept' | 'reject';
  validate(): void;
}

export class ResolveJoinRequestUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly spaceRepository: ISpaceRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly emailService: IEmailService
  ) {}

  public async execute(requestId: string, payload: ResolveRequestPayload): Promise<any> {
    if (!requestId) throw new Error('El ID de la solicitud es obligatorio.');
    payload.validate();

    const request = await this.membershipRepository.findRequestById(requestId);
    if (!request) throw new Error('La solicitud no fue encontrada.');
    if (request.status !== 'pending') {
      throw new Error('La solicitud ya fue resuelta anteriormente.');
    }

    const space = await this.spaceRepository.findById(request.space_id);
    if (!space) throw new Error('El espacio no fue encontrado.');

    if (space.owner_id !== payload.resolverId) {
      throw new Error('Solo el dueño del espacio puede resolver solicitudes.');
    }

    if (payload.action === 'accept') {
      await this.membershipRepository.addMember(
        request.space_id,
        request.requester_id,
        'member'
      );
    }

    const status = payload.action === 'accept' ? 'accepted' : 'rejected';
    const resolved = await this.membershipRepository.updateRequestStatus(
      requestId,
      status,
      payload.resolverId
    );

    const accepted = status === 'accepted';
    const title = accepted ? '¡Solicitud aceptada!' : 'Solicitud rechazada';
    const body = accepted
      ? `Ya eres parte de "${space.title}". Las finanzas compartidas se activan con 2+ miembros.`
      : `El dueño de "${space.title}" rechazó tu solicitud.`;

    await this.notificationRepository.create({
      userId: request.requester_id,
      type: accepted ? 'request_accepted' : 'request_rejected',
      title,
      body,
      resourceId: requestId
    });
    await this.emailService.sendToUser(request.requester_id, title, body);

    return resolved;
  }
}
