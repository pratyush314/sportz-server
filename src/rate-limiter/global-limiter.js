import { rateLimit } from "express-rate-limit";

const createRateLimit = (windowMs, max = 50) =>
  rateLimit({
    windowMs,
    legacyHeaders: false,
    limit: max,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    skip: (req) => req.path === "/ws",
  });

export const globalLimiter = createRateLimit(10 * 1000, 50);
