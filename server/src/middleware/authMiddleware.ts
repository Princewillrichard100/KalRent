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
      const decoded = jwt.decode(token) as DecodedToken | null;
      if (!decoded || !decoded.sub) {
        res.status(401).json({ message: "Invalid token structure" });
        return;
      }

      // Verify token expiration if exp claim exists
      if (decoded.exp && Math.floor(Date.now() / 1000) >= decoded.exp) {
        res.status(401).json({ message: "Token has expired" });
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
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    next();
  };
};
