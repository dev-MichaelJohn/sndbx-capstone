import rateLimit from "express-rate-limit";

/**
 * Custom key generator using User ID for authenticated sessions or IP address for guest sessions.
 * Prevents multiple users on campus Wi-Fi or computer labs from being throttled together.
 */
const userKeyGenerator = (req: any) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  return req.ip;
};

/**
 * Strict Rate Limiter for sensitive authentication routes (login, OTP, password reset).
 * Limit: 10 requests / 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication requests. Please try again in 15 minutes." },
});

/**
 * Generous Rate Limiter for standard protected API operations (data tables, dropdowns).
 * Limit: 3,000 requests / 15 minutes per User ID or IP.
 */
export const standardApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  keyGenerator: userKeyGenerator,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "API rate limit exceeded. Please slow down your requests." },
});

/**
 * High-Burst Rate Limiter for evaluation execution submissions (SET / SEF ratings).
 * Limit: 100 submission requests / 5 minutes per User ID or IP.
 */
export const evaluationExecutionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  keyGenerator: userKeyGenerator,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Evaluation submission burst limit reached. Please wait a moment." },
});
