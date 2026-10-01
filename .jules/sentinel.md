## 2025-05-10 - Avoid unverified jwt.decode in Auth Middleware
**Vulnerability:** In `server/src/middleware/authMiddleware.ts`, `jwt.decode()` was used to parse tokens instead of verifying their signature, allowing forged JWT tokens to bypass role authorization checks.
**Learning:** `jwt.decode()` only parses the token payload without validating the cryptographic signature or expiration, while `jwt.verify()` ensures authenticity.
**Prevention:** Always use `jwt.verify()` with a secret or public key in authentication middleware, and fail securely if `JWT_SECRET` is missing.
