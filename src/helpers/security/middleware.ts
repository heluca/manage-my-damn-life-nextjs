import { NextApiRequest, NextApiResponse } from 'next';
import { setSecurityHeaders } from './headers';
import { rateLimit, RateLimitConfig } from './rateLimiting';
import { csrfProtection } from './csrf';

export interface SecurityMiddlewareOptions {
  rateLimit?: RateLimitConfig;
  requireAuth?: boolean;
  requireCSRF?: boolean;
  allowedMethods?: string[];
}

export function withSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  options: SecurityMiddlewareOptions = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Always apply security headers
      setSecurityHeaders(res);
      
      // Check allowed methods
      if (options.allowedMethods && !options.allowedMethods.includes(req.method || '')) {
        return res.status(405).json({
          success: false,
          data: { message: 'METHOD_NOT_ALLOWED' }
        });
      }
      
      // Apply rate limiting if configured
      if (options.rateLimit) {
        if (!rateLimit(options.rateLimit)(req, res)) {
          return;
        }
      }
      
      // Apply CSRF protection if required
      if (options.requireCSRF !== false) {
        if (!csrfProtection(req, res)) {
          return;
        }
      }
      
      // Call the actual handler
      await handler(req, res);
      
    } catch (error) {
      console.error('Security middleware error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          data: { message: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  };
}

// Pre-configured middleware for common use cases
export const withAuthSecurity = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) =>
  withSecurity(handler, {
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
    requireAuth: true,
    requireCSRF: true,
    allowedMethods: ['POST']
  });

export const withAPISecurity = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) =>
  withSecurity(handler, {
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
    requireCSRF: true
  });

export const withPublicSecurity = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) =>
  withSecurity(handler, {
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 50 },
    requireCSRF: false
  });