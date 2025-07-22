import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '../../users/user.service';
import { MailService } from '../../mail/mail.service'; // Assume you have a mail service
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    user.isVerified = true;
    user.verificationToken = null;
    await this.userService.update(user.id, {
      isVerified: true,
      verificationToken: null,
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Do not reveal user existence
      return;
    }
    user.verificationToken = uuidv4();
    await this.userService.update(user.id, {
      verificationToken: user.verificationToken,
    });
    await this.mailService.sendVerificationEmail(user.email, user.verificationToken);
    user.verificationToken = uuidv4();
    await this.userService.update(user.id, { verificationToken: user.verificationToken });
    await this.mailService.sendVerificationEmail(user.email, user.verificationToken);
  }
}