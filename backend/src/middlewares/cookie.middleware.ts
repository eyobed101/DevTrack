import { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';

export const cookieMiddleware = cookieParser();