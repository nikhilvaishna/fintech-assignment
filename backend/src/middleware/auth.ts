import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface JwtPayload {
  userId: string;
  type: "access" | "refresh";
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized", message: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    if (decoded.type !== "access") {
      res.status(401).json({ error: "Unauthorized", message: "Invalid token type" });
      return;
    }
    (req as Request & { userId?: string }).userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", message: "Invalid or expired access token" });
  }
}
