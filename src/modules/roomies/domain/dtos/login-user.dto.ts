export class LoginUserDto {
  email!: string;
  password!: string;

  public validate(): void {
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Validation Error: Formato de correo inválido.');
    }
    if (!this.password) {
      throw new Error('Validation Error: La contraseña es requerida.');
    }
  }
}