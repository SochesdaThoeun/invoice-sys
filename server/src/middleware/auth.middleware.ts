import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const authMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string, role: string };
    
    // Fetch user in the background and continue with request
    AppDataSource.getRepository(User)
      .findOneBy({ id: decoded.sub })
      .then(user => {
        if (!user) {
          res.status(401).json({ message: 'Unauthorized: Invalid user' });
          return;
        }
        
        // Attach user to request object
        req.user = user;
        next();
      })
      .catch(() => {
        res.status(500).json({ message: 'Internal server error' });
      });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}; 