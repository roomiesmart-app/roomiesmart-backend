export interface IEmailService {

  sendToUser(userId: string, subject: string, message: string): Promise<void>;
}
