// Security configuration constants
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    SPECIAL_CHARS: '@$!%*?&'
  },
  
  // Rate limiting
  RATE_LIMITS: {
    AUTH: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      message: 'Too many authentication attempts'
    },
    API: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      message: 'Too many API requests'
    },
    REGISTRATION: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      message: 'Too many registration attempts'
    },
    CALDAV: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10,
      message: 'Too many CalDAV requests'
    }
  },
  
  // Session management
  SESSION: {
    MAX_CONCURRENT_LOGINS: parseInt(process.env.MAX_CONCURRENT_LOGINS_ALLOWED || '5'),
    MAX_SESSION_LENGTH: parseInt(process.env.MAX_SESSION_LENGTH || '2592000'), // 30 days
    ENFORCE_TIMEOUT: process.env.ENFORCE_SESSION_TIMEOUT?.toLowerCase() === 'true'
  },
  
  // CSRF protection
  CSRF: {
    TOKEN_LENGTH: 32,
    HEADER_NAME: 'x-csrf-token',
    COOKIE_NAME: 'csrf-token'
  },
  
  // Input validation
  VALIDATION: {
    USERNAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 50,
      PATTERN: /^[a-zA-Z0-9_-]+$/
    },
    ACCOUNT_NAME: {
      MAX_LENGTH: 100
    },
    TASK_SUMMARY: {
      MAX_LENGTH: 500
    },
    TASK_DESCRIPTION: {
      MAX_LENGTH: 5000
    }
  },
  
  // Encryption
  ENCRYPTION: {
    ALGORITHM: 'aes-256-cbc',
    IV_LENGTH: 16
  },
  
  // Security headers
  HEADERS: {
    CONTENT_SECURITY_POLICY: 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';",
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
    PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  SECURITY_CONFIG.RATE_LIMITS.API.maxRequests = 1000;
  SECURITY_CONFIG.RATE_LIMITS.CALDAV.maxRequests = 50;
}

export default SECURITY_CONFIG;