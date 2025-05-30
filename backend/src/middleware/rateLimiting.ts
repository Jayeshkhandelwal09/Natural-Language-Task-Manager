import rateLimit from 'express-rate-limit';

// Different limits for different endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests from this IP'
});

export const aiProcessingLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 10,                   // 10 AI processing requests per minute
  message: 'Too many AI processing requests'
});

export const audioUploadLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 3,                    // 3 audio uploads per minute
  message: 'Too many audio upload requests'
}); 