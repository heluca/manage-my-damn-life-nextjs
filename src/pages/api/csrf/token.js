import { setCSRFToken } from '@/helpers/security/csrf';
import { setSecurityHeaders } from '@/helpers/security/headers';

export default function handler(req, res) {
  // Apply security headers
  setSecurityHeaders(res);
  
  if (req.method === 'GET') {
    // Generate and set CSRF token in cookie
    const token = setCSRFToken(res);
    
    // Return the token to the client
    res.status(200).json({ token });
  } else {
    res.status(405).json({ 
      success: false, 
      data: { message: "METHOD_NOT_ALLOWED" } 
    });
  }
}