import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../utils/auth';
import { prisma } from '../config';

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
      return;
    }

    // Optional quick check to ensure user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed.' });
    return;
  }
}
