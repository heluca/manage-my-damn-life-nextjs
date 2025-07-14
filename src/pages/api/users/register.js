import validator from 'validator';
import { checkifUserisInDB } from '@/helpers/api/user';
import { insertUserIntoDB } from '@/helpers/api/user';
import { rateLimit, rateLimitConfigs } from '@/helpers/security/rateLimiting';
import { setSecurityHeaders } from '@/helpers/security/headers';
import { validateUserRegistration, sanitizeObject } from '@/helpers/security/validation';
import { csrfProtection } from '@/helpers/security/csrf';
export default async function handler(req, res) {
    // Apply security headers
    setSecurityHeaders(res);
    
    if (req.method === 'POST') {
        // Apply rate limiting
        if (!rateLimit(rateLimitConfigs.registration)(req, res)) {
            return;
        }
        
        // Apply CSRF protection
        if (!csrfProtection(req, res)) {
            return;
        }
        
        // Sanitize input
        const sanitizedBody = sanitizeObject(req.body);
        
        // Validate input
        const validation = validateUserRegistration({
            username: sanitizedBody.username,
            password: req.body.password, // Don't sanitize password
            email: sanitizedBody.email
        });
        
        if (!validation.valid) {
            return res.status(422).json({ 
                success: false, 
                data: { message: "INVALID_INPUT", errors: validation.errors } 
            });
        }
        
        const { username, password, email } = validation;
        
        try {
            if (await checkifUserisInDB(username)) {
                return res.status(409).json({ 
                    success: false, 
                    data: { message: "ERROR_LOGIN_WITH_PASSWORD" } 
                });
            }
            
            const response = await insertUserIntoDB(username, password, email);
            
            if (response) {
                res.status(201).json({ 
                    success: true, 
                    data: { message: "USER_INSERT_OK" } 
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    data: { message: "CANT_CREATE_USER" } 
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                success: false, 
                data: { message: "INTERNAL_SERVER_ERROR" } 
            });
        }
    } else {
        res.status(405).json({ 
            success: false, 
            data: { message: "METHOD_NOT_ALLOWED" } 
        });
    }
}
