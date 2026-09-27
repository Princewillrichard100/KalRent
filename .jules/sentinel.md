## 2025-02-27 - JWT Decode Bypass and Null Dereference Vulnerability in authMiddleware
**Vulnerability:** `jwt.decode` can return `null` if given a malformed or invalid token string, causing runtime type errors when accessing properties on `decoded`. Furthermore, token expiration (`exp` claim) was not validated, allowing expired JWT tokens to be accepted as valid authorization.
**Learning:** Even when decoding unverified JWT payloads (or passing through client tokens), middleware must check if the decoded payload is non-null and validate expiration timestamps to prevent unauthenticated access or server crashes.
**Prevention:** Always check `if (!decoded || typeof decoded !== 'object' || !decoded.sub)` and validate `decoded.exp` before using JWT token claims.
