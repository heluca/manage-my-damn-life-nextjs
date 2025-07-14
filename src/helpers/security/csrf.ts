import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function setCSRFToken(res: NextApiResponse): string {
  const token = generateCSRFToken();
  
  res.setHeader('Set-Cookie', [
    `${CSRF_COOKIE_NAME}=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Path=/`
  ]);
  
  return token;
}

export function validateCSRFToken(req: NextApiRequest): boolean {
  // Skip CSRF validation for GET requests
  if (req.method === 'GET') {
    return true;
  }
  
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;
  const tokenFromCookie = parseCookies(req.headers.cookie || '')[CSRF_COOKIE_NAME];
  
  if (!tokenFromHeader || !tokenFromCookie) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(tokenFromHeader, 'hex'),
    Buffer.from(tokenFromCookie, 'hex')
  );
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

export function csrfProtection(req: NextApiRequest, res: NextApiResponse): boolean {
  if (!validateCSRFToken(req)) {
    res.status(403).json({
      success: false,
      data: { message: 'CSRF token validation failed' }
    });
    return false;
  }
  
  return true;
}