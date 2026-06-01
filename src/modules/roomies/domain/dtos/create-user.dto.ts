export class CreateUserDto {
  name!: string;
  email!: string;
  password!: string; // this will be the plain text password that we will validate and then hash before sending to the domain

  // validation method to ensure the password meets the security requirements (at least 8 characters and contains a special character)
  public validatePassword(): void {
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    
    if (!passwordRegex.test(this.password)) {
      throw new Error(
        'Validation Error: La contraseña debe tener al menos 8 caracteres y contener un caracter especial.'
      );
    }
  }
}