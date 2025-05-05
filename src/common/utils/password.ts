// src/common/utils/password.ts
import { genSalt, hash, compare } from 'bcrypt';
import { logger } from '../../config/logger';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await genSalt(SALT_ROUNDS);
    return await hash(password, salt);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    return false;
  }
}