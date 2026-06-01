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
    preferences: Record<string, any> = {}, 
    id: string | null = null,
    ai_embedding: number[] | null = null,
    created_at: Date = new Date()
  ): User {
    // Here you can add any additional logic before creating the user, like generating an ID if 
    // not provided, or hashing the password if you want to do it here (though it's better to do it in the use case).
    const user = new User(id, name, email, password_hash, preferences, ai_embedding, created_at);
    user.validate();
    return user;
  }

  get password(): string {
    return this.password_hash;
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Validation Error: El nombre debe tener al menos 2 caracteres.');
    }

    const uceEmailRegex = /^[a-zA-Z0-9._%+-]+@uce\.edu\.ec$/;
    if (!this.email || !uceEmailRegex.test(this.email)) {
      throw new Error('Validation Error: El correo debe ser institucional y terminar en @uce.edu.ec.');
    }

    if (!this.password_hash || this.password_hash.trim().length === 0) {
      throw new Error('Validation Error: El hash de la contraseña es requerido por seguridad.');
    }
  }
}