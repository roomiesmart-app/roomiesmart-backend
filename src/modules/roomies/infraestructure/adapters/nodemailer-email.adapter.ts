import nodemailer, { type Transporter } from 'nodemailer';
import { supabase } from '../../../../core/database.js';
import { logger } from '../../../../core/logger.js';
import type { IEmailService } from '../../application/ports/email.service.js';

let transporter: Transporter | null = null;
let smtpDisabledWarned = false;

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!smtpDisabledWarned) {
      logger.warn('Emails deshabilitados: faltan SMTP_HOST/SMTP_USER/SMTP_PASS en .env');
      smtpDisabledWarned = true;
    }
    return null;
  }

  if (!transporter) {
    const port = Number(SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

export class NodemailerEmailAdapter implements IEmailService {
  public async sendToUser(userId: string, subject: string, message: string): Promise<void> {
    try {
      const transport = getTransporter();
      if (!transport) return;

      const { data: user, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .maybeSingle();

      if (error || !user?.email) {
        logger.warn(`Email no enviado: usuario ${userId} sin correo (${error?.message || 'no encontrado'})`);
        return;
      }

      await transport.sendMail({
        from: process.env.SMTP_FROM || `RoomieSmart <${process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        html: buildNotificationEmailHtml(subject, message)
      });

      logger.info(`Email "${subject}" enviado a ${user.email}`);
    } catch (err: any) {
      logger.error(`Fallo enviando email a ${userId}: ${err.message}`);
    }
  }
}

export function buildNotificationEmailHtml(title: string, body: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #F1DED6;border-radius:16px;overflow:hidden">
    <div style="background:#8C3A27;color:#fff;padding:20px 24px">
      <h1 style="margin:0;font-size:20px">RoomieSmart</h1>
    </div>
    <div style="padding:24px;color:#3B241C">
      <h2 style="margin:0 0 8px;font-size:18px">${title}</h2>
      <p style="margin:0 0 20px;color:#5C5C5C;font-size:14px;line-height:1.5">${body}</p>
      <a href="https://prod.roomiesmart.lat"
         style="display:inline-block;background:#8C3A27;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:bold">
        Abrir RoomieSmart
      </a>
    </div>
  </div>`;
}