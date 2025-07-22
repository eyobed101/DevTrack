import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../users/user.service';
import { JwtService } from './jwt.service';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class PasswordService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password.trim(), saltRounds);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword.trim(), hashedPassword);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return;
    }

    const resetToken = await this.jwtService.generatePasswordResetToken(user);

    // Save reset token to user
    await this.usersService.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
    });

    // Send email with reset link
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const payload = await this.jwtService.verifyPasswordResetToken(token);
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.resetPasswordToken !== token || !user.resetPasswordExpires) {
      throw new Error('Invalid or expired password reset token');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw new Error('Password reset token has expired');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}