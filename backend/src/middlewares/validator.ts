// src/middlewares/validator.ts
import { plainToInstance } from 'class-transformer';
import { validate as classValidatorValidate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';

export function validate(dtoClass: any): RequestHandler {
  return async (req, res, next) => {
    const output = plainToInstance(dtoClass, req.body);
    const errors = await classValidatorValidate(output, { skipMissingProperties: false });

    if (errors.length > 0) {
      const message = errors.map((error: ValidationError) => 
        Object.values(error.constraints || {})).join(', ');
      res.status(400).json({ success: false, message });
      return;
    }

    req.body = output;
    next();
  };
}