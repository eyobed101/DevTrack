import { Request, Response, NextFunction } from 'express';

const rbacMiddleware = (allowedRoles: string[]) => 
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Type assertion to inform TypeScript about the expected structure of req.user
    const user = req.user as { id: number; name: string; roles: { name: string }[] };

    const userRoles = user.roles.map(role => role.name);
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };

  export default rbacMiddleware;