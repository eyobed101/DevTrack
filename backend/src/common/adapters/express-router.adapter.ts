// src/common/adapters/express-router.adapter.ts
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ExpressRouterAdapter implements NestMiddleware {
  constructor(private readonly controller: any) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Implement route handling here if needed
  }

  static adapt(controllerMethod: Function) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await controllerMethod(req, res);
        if (result) {
          res.status(result.statusCode || 200).json(result);
        }
      } catch (error) {
        next(error);
      }
    };
  }
}