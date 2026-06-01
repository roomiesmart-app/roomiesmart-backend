export class User {
  private constructor(
    public readonly id: string | null,
    public name: string,
    public email: string,
    public password_hash: string,
    public preferences: Record<string, any>,
    public ai_embedding: number[] | null,
    public readonly created_at: Date
  ) {}

  public static create(
    name: string,
    email: string,
    password_hash: string,
    id: string | null = null,
    preferences: Record<string, any> = {},
    ai_embedding: number[] | null = null,
    created_at: Date = new Date()
  ): User {
    const user = new User(id, name, email, password_hash, preferences, ai_embedding, created_at);
    user.validate();
    return user;
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Validation Error: El nombre debe tener al menos 2 caracteres.');
    }

    // Validación exclusiva para la comunidad universitaria
    const uceEmailRegex = /^[a-zA-Z0-9._%+-]+@uce\.edu\.ec$/;
    if (!this.email || !uceEmailRegex.test(this.email)) {
      throw new Error('Validation Error: El correo debe ser institucional y terminar en @uce.edu.ec.');
    }

    // Aquí validamos que estemos guardando el hash seguro, NO la clave en texto plano
    if (!this.password_hash || this.password_hash.trim().length === 0) {
      throw new Error('Validation Error: El hash de la contraseña es requerido por seguridad.');
    }
  }
}