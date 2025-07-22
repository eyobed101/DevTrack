import { Request, Response, NextFunction } from 'express';


// Define or import UserWithPermissions type
type UserWithPermissions = {
  permissions: { name: string }[];
  // add other user properties if needed
};

const permissionsMiddleware = (requiredPermissions: string[]) => 
  (req: Request & { user?: UserWithPermissions }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userPermissions = req.user.permissions.map(p => p.name);
    const hasAllPermissions = requiredPermissions.every(perm => 
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ 
        message: 'Missing required permissions',
        required: requiredPermissions,
        has: userPermissions
      });
    }

    next();
  };

export default permissionsMiddleware;