// filepath: d:\Eyo\portfolio\DevTrack\src\middlewares\authenticate.ts
import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include the 'user' property
declare global {
    namespace Express {
        interface Request {
            user?: { id: number; name: string };
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    // Mock authentication logic
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
    } else {
        // Mock token verification
        req.user = { id: 1, name: 'John Doe' }; // Attach user to request
        next();
    }
};