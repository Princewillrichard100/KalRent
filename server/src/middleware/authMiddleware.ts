import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  sub: string;
  "custom:role"?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      // SECURITY FIX: Verify JWT signature using jwt.verify instead of unverified decoding
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET environment variable is not configured");
        res.status(500).json({ message: "Internal server error" });
        return;
      }

      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

      if (!decoded || typeof decoded !== "object" || !decoded.sub) {
        res.status(401).json({ message: "Invalid token payload" });
        return;
      }

      const userRole = decoded["custom:role"] || "";
      req.user = {
        id: decoded.sub,
        role: userRole,
      };

      const hasAccess = allowedRoles.includes(userRole.toLowerCase());
      if (!hasAccess) {
        res.status(403).json({ message: "Access Denied" });
        return;
      }
    } catch (err) {
      console.error("Failed to verify token:", err);
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    next();
  };
};
