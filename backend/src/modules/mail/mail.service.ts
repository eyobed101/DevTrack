import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { User } from '../../modules/users/entities/user.entity';
import { Project } from '../../modules/projects/entities/project.entity';
import { Task } from '../../modules/tasks/entities/task.entity';
import { logger } from '../../config/logger';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private templatesDir = path.join(__dirname, 'templates');

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.registerPartials();
  }

  private initializeTransporter() {
    const mailConfig = {
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: this.configService.get('MAIL_TLS_REJECT_UNAUTHORIZED') === 'true',
      },
    };

    this.transporter = nodemailer.createTransport(mailConfig);

    // Verify connection configuration
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
        from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
        ...options,
      });
      
      logger.log({ level: 'info', message: `Email sent: ${info.messageId}` });
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(user: User, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    const html = await this.renderTemplate('password-reset', {
      name: user.firstName,
      resetUrl,
      supportEmail: this.configService.get('SUPPORT_EMAIL'),
    });

    await this.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendEmailVerification(user: User, token: string): Promise<void> {
    const verifyUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    const html = await this.renderTemplate('email-verification', {
      name: user.firstName,
      verifyUrl,
      supportEmail: this.configService.get('SUPPORT_EMAIL'),
    });

    await this.sendMail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  async sendProjectInvitation(
    inviter: User,
    invitee: User,
    project: Project,
    role: string,
    token?: string
  ): Promise<void> {
    const acceptUrl = token 
      ? `${this.configService.get('FRONTEND_URL')}/accept-invitation?token=${token}`
      : `${this.configService.get('FRONTEND_URL')}/projects/${project.id}`;

    const html = await this.renderTemplate('project-invitation', {
      inviterName: inviter.firstName,
      inviteeName: invitee.firstName,
      projectName: project.name,
      role,
      acceptUrl,
      supportEmail: this.configService.get('SUPPORT_EMAIL'),
    });

    await this.sendMail({
      to: invitee.email,
      subject: `You've been invited to join "${project.name}"`,
      html,
    });
  }

  async sendTaskAssignmentNotification(
    user: User,
    task: Task,
    assigner: User
  ): Promise<void> {
    const taskUrl = `${this.configService.get('FRONTEND_URL')}/tasks/${task.id}`;
    const html = await this.renderTemplate('task-assignment', {
      userName: user.firstName,
      taskTitle: task.title,
      projectName: task.project.name,
      assignerName: assigner.firstName,
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set',
      priority: task.priority,
      taskUrl,
      supportEmail: this.configService.get('SUPPORT_EMAIL'),
    });

    await this.sendMail({
      to: user.email,
      subject: `You've been assigned a new task: ${task.title}`,
      html,
    });
  }

  async sendProjectRoleUpdate(
    user: User,
    project: Project,
    newRole: string
  ): Promise<void> {
    const projectUrl = `${this.configService.get('FRONTEND_URL')}/projects/${project.id}`;
    const html = await this.renderTemplate('project-role-update', {
      userName: user.firstName,
      projectName: project.name,
      newRole,
      projectUrl,
      supportEmail: this.configService.get('SUPPORT_EMAIL'),
    });

    await this.sendMail({
      to: user.email,
      subject: `Your role in "${project.name}" has been updated`,
      html,
    });
  }

  async sendCustomEmail(
    to: string | string[],
    subject: string,
    templateName: string,
    context: Record<string, any>,
    attachments?: nodemailer.SendMailOptions['attachments']
  ): Promise<void> {
    const html = await this.renderTemplate(templateName, context);
    
    await this.sendMail({
      to,
      subject,
      html,
      attachments,
    });
  }
}