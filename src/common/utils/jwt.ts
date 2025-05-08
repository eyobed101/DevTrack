import jwt from 'jsonwebtoken';
import { User } from '../../modules/users/entities/user.entity';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function createTokens(user: User): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}