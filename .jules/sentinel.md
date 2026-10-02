## 2026-10-02 - JWT Verification Bypass via Unverified Decoding

**Vulnerability:** The Express authentication middleware was decoding incoming JWT Bearer tokens using `jwt.decode()` rather than verifying their signature with `jwt.verify()`. This allowed unauthenticated attackers to forge arbitrary claims (such as `custom:role: "admin"` or `custom:role: "manager"`) and bypass authentication checks without providing a valid signature.

**Learning:** `jwt.decode()` only parses the token payload without validating the cryptographic signature or expiration, making it unsuitable for access control decisions.

**Prevention:** Always use `jwt.verify(token, secret)` in authentication middleware to ensure that token integrity, authenticity, and signature are cryptographically validated before granting authorization.
