import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};