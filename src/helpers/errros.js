import { varNotEmpty } from "./general";

interface ErrorResponse {
    success: false;
    data: {
        message: string;
        details?: string;
        code?: string;
    };
}

export function getErrorResponse(e: any, includeDetails: boolean = false): ErrorResponse {
    // Log the full error for debugging
    console.error('Error occurred:', e);
    
    if (varNotEmpty(e) && varNotEmpty(e.message)) {
        return {
            success: false,
            data: {
                message: sanitizeErrorMessage(e.message),
                details: includeDetails && process.env.NODE_ENV === 'development' ? JSON.stringify(e) : undefined,
                code: e.code || 'UNKNOWN_ERROR'
            }
        };
    } else {
        return {
            success: false,
            data: {
                message: "INTERNAL_SERVER_ERROR",
                code: 'GENERIC_ERROR'
            }
        };
    }
}

// Sanitize error messages to prevent information leakage
function sanitizeErrorMessage(message: string): string {
    // Remove sensitive information patterns
    const sensitivePatterns = [
        /password[\s]*[:=][\s]*[^\s]+/gi,
        /token[\s]*[:=][\s]*[^\s]+/gi,
        /key[\s]*[:=][\s]*[^\s]+/gi,
        /secret[\s]*[:=][\s]*[^\s]+/gi,
        /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g // Email addresses
    ];
    
    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    
    return sanitized;
}

export function createSecureError(message: string, code?: string): ErrorResponse {
    return {
        success: false,
        data: {
            message: sanitizeErrorMessage(message),
            code: code || 'APPLICATION_ERROR'
        }
    };
} 