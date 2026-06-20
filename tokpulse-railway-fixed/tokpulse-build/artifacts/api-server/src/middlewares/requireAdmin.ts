import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const ADMIN_SECRET = process.env.SESSION_SECRET ?? "tokpulse-admin-secret";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, ADMIN_SECRET);
    (req as any).adminPayload = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired admin token" });
  }
}
