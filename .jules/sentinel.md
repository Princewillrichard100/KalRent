## 2025-05-18 - Unverified JWT Token Decoding in Authentication Middleware
**Vulnerability:** `jwt.decode()` was used in `server/src/middleware/authMiddleware.ts` to inspect JWT claims without verifying cryptographic signature or expiration, allowing authentication and authorization bypass with forged tokens.
**Learning:** `jwt.decode()` only parses token structure without verifying cryptographic authenticity. Express authentication middleware must always use `jwt.verify()` with secret keys or public verification certificates.
**Prevention:** Always verify incoming JWT signatures using `jwt.verify()` and secret/public keys in middleware before trusting claim values such as `sub` or `role`.
