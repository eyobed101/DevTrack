export interface JwtPayload {
  sub: string; // User ID
  email?: string;
  username?: string;
  roles?: string[];
}