import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 sec
    limit: 5, // Limit each IP to 5 requests per `window` (here, per 10 sec)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})