import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { User } from '../../modules/users/entities/user.entity';
import { logger } from '../../config/logger';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private templatesDir = path.join(__dirname, 'templates');

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.registerPartials();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: this.configService.get('EMAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: this.configService.get('EMAIL_TLS_REJECT_UNAUTHORIZED') === 'true',
      },
    });



    this.transporter.verify((error) => {
      if (error) {
        logger.error('Mail transporter verification failed:', error);
      } else {
        logger.log({ level: 'info', message: 'Mail transporter is ready to send messages' });
      }
    });
  }

  private registerPartials() {
    const partialsDir = path.join(this.templatesDir, 'partials');

    if (fs.existsSync(partialsDir)) {
      fs.readdirSync(partialsDir).forEach(filename => {
        const matches = /^([^.]+).hbs$/.exec(filename);
        if (!matches) return;

        const name = matches[1];
        const template = fs.readFileSync(path.join(partialsDir, filename), 'utf8');
        handlebars.registerPartial(name, template);
      });
    }
  }

  private async renderTemplate(templateName: string, context: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    return template(context);
  }

  private async sendMail(options: nodemailer.SendMailOptions): Promise<void> {
    try {

      const info = await this.transporter.sendMail({
        from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('EMAIL_FROM_ADDRESS')}>`,
        ...options,
      });

      logger.log({ level: 'info', message: `Email sent: ${info.messageId}` });
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    const html = await this.renderTemplate('email-verification', {
      verifyUrl,
      appName: this.configService.get('APP_NAME'),
      supportEmail: this.configService.get('SUPPORT_EMAIL'),
    });

    await this.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    const html = await this.renderTemplate('password-reset', {
      resetUrl,
      appName: this.configService.get('APP_NAME'),
      supportEmail: this.configService.get('SUPPORT_EMAIL'),
    });

    await this.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  // Keep your existing methods for project/task notifications
  async sendProjectInvitation(
    inviter: User,
    invitee: User,
    project: Project,
    role: string,
    token?: string
  ): Promise<void> {
    // ... existing implementation
  }

  async sendTaskAssignmentNotification(
    user: User,
    task: Task,
    assigner: User
  ): Promise<void> {
    // ... existing implementation
  }

  async sendProjectRoleUpdate(
    user: User,
    project: Project,
    newRole: string
  ): Promise<void> {
    // ... existing implementation
  }

  async sendCustomEmail(
    to: string | string[],
    subject: string,
    templateName: string,
    context: Record<string, any>,
    attachments?: nodemailer.SendMailOptions['attachments']
  ): Promise<void> {
    // ... existing implementation
  }
}