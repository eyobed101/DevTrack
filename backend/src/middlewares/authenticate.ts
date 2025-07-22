// filepath: d:\Eyo\portfolio\DevTrack\src\middlewares\authenticate.ts
import { Request, Response, NextFunction } from 'express';

// Define your own User type
interface User {
    id: string;
    name: string;
}

// No need to redeclare the user property if using @types/passport

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    // Mock authentication logic
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
    } else {
        // Mock token verification
        req.user = { id: '1', name: 'John Doe' }; // Attach user to request
        next();
    }
};
