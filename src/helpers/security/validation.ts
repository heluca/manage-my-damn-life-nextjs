import validator from 'validator';

// Validation schemas
export interface UserRegistrationInput {
  username: string;
  password: string;
  email: string;
}

export interface CalDAVAccountInput {
  url: string;
  username: string;
  password: string;
  accountname: string;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and escape special characters
  const sanitized = validator.escape(input.replace(/(<([^>]+)>)/gi, ''));
  
  // Additional XSS protection
  return sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '');
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Validation functions
export function validateUserRegistration(input: UserRegistrationInput): { valid: boolean; errors: string[]; username?: string; password?: string; email?: string } {
  const errors: string[] = [];
  
  if (!input.username || input.username.length < 3 || input.username.length > 50) {
    errors.push('Username must be 3-50 characters');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(input.username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  if (!input.password || input.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/.test(input.password)) {
    errors.push('Password must contain uppercase, lowercase, number, and special character');
  }
  
  if (!validator.isEmail(input.email)) {
    errors.push('Invalid email format');
  }
  
  return { 
    valid: errors.length === 0, 
    errors,
    username: input.username,
    password: input.password,
    email: input.email
  };
}

export function validateCalDAVAccount(input: CalDAVAccountInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isValidCalDAVUrl(input.url)) {
    errors.push('Invalid CalDAV URL');
  }
  
  if (!input.username || input.username.length > 255) {
    errors.push('Username is required and must be less than 255 characters');
  }
  
  if (!input.password) {
    errors.push('Password is required');
  }
  
  if (!input.accountname || input.accountname.length > 100) {
    errors.push('Account name is required and must be less than 100 characters');
  }
  
  return { valid: errors.length === 0, errors };
}

// URL validation for CalDAV
export function isValidCalDAVUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Allow localhost for development
  if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
    return true;
  }
  
  // Validate standard URLs
  if (!validator.isURL(url, { protocols: ['http', 'https'] })) {
    return false;
  }
  
  // Block private IP ranges in production
  if (process.env.NODE_ENV === 'production') {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Block private IP ranges
      const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^127\./,
        /^169\.254\./,
        /^::1$/,
        /^fc00:/,
        /^fe80:/
      ];
      
      if (privateRanges.some(range => range.test(hostname))) {
        return false;
      }
    } catch {
      return false;
    }
  }
  
  return true;
}

// SQL injection prevention helpers
export function escapeSQL(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '\\;')
    .replace(/--/g, '\\--')
    .replace(/\/\*/g, '\\/\\*')
    .replace(/\*\//g, '\\*\\/');
}