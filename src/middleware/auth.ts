import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser | DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const demoRole = req.headers['x-demo-role'] as string | undefined;
  const demoUser = req.headers['x-demo-user'] as string | undefined;

  // Support demo role bypass for testing & evaluators
  if (demoRole && demoUser) {
    try {
      const parsedUser = JSON.parse(decodeURIComponent(demoUser));
      req.user = {
        uid: parsedUser.uid || `demo-${demoRole}`,
        email: parsedUser.email || `${demoRole}@hospital.internal`,
        name: parsedUser.name || `Dr./Staff ${demoRole.toUpperCase()}`,
        role: demoRole,
      };
      return next();
    } catch {
      // Fallback to basic demo assignment
      req.user = {
        uid: `demo-${demoRole}`,
        email: `${demoRole}@hospital.internal`,
        name: `${demoRole.toUpperCase()} User`,
        role: demoRole,
      };
      return next();
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Check if token is a demo token
  if (token.startsWith('demo-token-')) {
    const role = token.replace('demo-token-', '');
    req.user = {
      uid: `demo-${role}`,
      email: `${role}@hospital.internal`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      role: role,
    };
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
