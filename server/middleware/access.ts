// Access Control Middleware
// Filters content by access level: public, community, restricted
import { Request, Response, NextFunction } from 'express';
import type { AccessLevel } from '../db/schema';

export type AccessContext = 'public' | 'reviewer';

// Determines access context from request
// Reviewers (authenticated via token) can see all content including restricted
// Public users see public + community content
export function getAccessContext(req: Request): AccessContext {
  const token =
    (req.headers['x-reviewer-token'] as string | undefined) ||
    (req.query.token as string | undefined);
  const reviewerToken = process.env.REVIEWER_TOKEN || 'lakota-review-2026';
  return token === reviewerToken ? 'reviewer' : 'public';
}

// Returns allowed access levels for the current request context
export function getAllowedAccessLevels(context: AccessContext): AccessLevel[] {
  if (context === 'reviewer') {
    return ['public', 'community', 'restricted'];
  }
  return ['public', 'community'];
}

// Express middleware that attaches access context to request
export function attachAccessContext(req: Request, _res: Response, next: NextFunction) {
  (req as any).accessContext = getAccessContext(req);
  (req as any).allowedAccessLevels = getAllowedAccessLevels((req as any).accessContext);
  next();
}
