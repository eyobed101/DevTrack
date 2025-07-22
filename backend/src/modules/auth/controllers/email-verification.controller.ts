// src/auth/controllers/email-verification.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Res,
  HttpStatus,
  Redirect,
} from '@nestjs/common';
import { EmailVerificationService } from '../services/email-verification.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication - Email Verification')
@Controller('auth/verify-email')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email successfully verified',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid token, expired token, or user not found',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.emailVerificationService.verifyEmail(verifyEmailDto.token);
    return { message: 'Email verified successfully' };
  }

  @Get()
  @Public()
  @Redirect()
  @ApiOperation({ summary: 'Verify email address via GET request' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Verification token sent to email',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirects to success or failure URL',
  })
  async verifyEmailGet(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    try {
      await this.emailVerificationService.verifyEmail(token);
      return {
        url: this.configService.get<string>('EMAIL_VERIFICATION_SUCCESS_URL'),
      };
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Unknown error';
      return {
        url: `${this.configService.get<string>('EMAIL_VERIFICATION_FAILURE_URL')}?error=${encodeURIComponent(errorMessage)}`,
      };
    }
  }

  @Post('resend')
  @Public()
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification email resent if user exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email or user already verified',
  })
  async resendVerificationEmail(@Body('email') email: string) {
    await this.emailVerificationService.resendVerificationEmail(email);
    return { message: 'If an account exists, a verification email has been sent' };
  }
}