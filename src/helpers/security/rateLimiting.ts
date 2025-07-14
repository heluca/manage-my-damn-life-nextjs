import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

// Default rate limit configurations
export const rateLimitConfigs = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5, message: 'Too many authentication attempts' },
  api: { windowMs: 15 * 60 * 1000, maxRequests: 100, message: 'Too many API requests' },
  registration: { windowMs: 60 * 60 * 1000, maxRequests: 3, message: 'Too many registration attempts' },
  caldav: { windowMs: 5 * 60 * 1000, maxRequests: 10, message: 'Too many CalDAV requests' }
};

export function rateLimit(config: RateLimitConfig) {
  return (req: NextApiRequest, res: NextApiResponse, next?: () => void): boolean => {
    const key = getClientKey(req);
    const now = Date.now();
    
    // Clean expired entries
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
    
    // Initialize or increment counter
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs
      };
    } else {
      store[key].count++;
    }
    
    // Check if limit exceeded
    if (store[key].count > config.maxRequests) {
      res.status(429).json({
        success: false,
        data: {
          message: config.message || 'Rate limit exceeded',
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
        }
      });
      return false;
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', config.maxRequests - store[key].count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));
    
    if (next) next();
    return true;
  };
}

function getClientKey(req: NextApiRequest): string {
  // Use IP address as key, with fallback for proxied requests
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.socket.remoteAddress;
  return `rate_limit:${ip}`;
}

// Cleanup function to remove expired entries
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
  });
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);