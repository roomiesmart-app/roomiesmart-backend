export class CreateSpaceRequestDto {
  requesterId!: string;
  message?: string;

  public validate(): void {
    if (!this.requesterId) {
      throw new Error('El ID del solicitante es obligatorio.');
    }
  }
}

export class ResolveSpaceRequestDto {
  resolverId!: string;
  action!: 'accept' | 'reject';

  public validate(): void {
    if (!this.resolverId) {
      throw new Error('El ID de quien resuelve es obligatorio.');
    }
    if (this.action !== 'accept' && this.action !== 'reject') {
      throw new Error("La acción debe ser 'accept' o 'reject'.");
    }
  }
}
