import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { prisma } from "../db.js";
import { config } from "../config.js";
import type { JwtPayload } from "../middleware/auth.js";

const router = Router();
const { accessSecret, refreshSecret, accessExpiresIn, refreshExpiresIn, refreshCookieName } = config.jwt;

function signAccessToken(userId: string): string {
  return jwt.sign({ userId, type: "access" }, accessSecret, { expiresIn: accessExpiresIn });
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: "refresh" }, refreshSecret, { expiresIn: refreshExpiresIn });
}

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("name").optional().trim().isLength({ max: 100 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed", details: errors.array() });
      return;
    }
    const { email, password, name } = req.body as { email: string; password: string; name?: string };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: "Bad request", message: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || null },
      select: { id: true, email: true, name: true },
    });
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    res.cookie(refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
      expiresIn: 900,
    });
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed", details: errors.array() });
      return;
    }
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    res.cookie(refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
      expiresIn: 900,
    });
  }
);

router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[refreshCookieName] ?? req.body?.refreshToken ?? req.headers["x-refresh-token"];
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "Unauthorized", message: "Refresh token required" });
    return;
  }
  try {
    const decoded = jwt.verify(token, refreshSecret) as JwtPayload;
    if (decoded.type !== "refresh") {
      res.status(401).json({ error: "Unauthorized", message: "Invalid token type" });
      return;
    }
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
      res.status(401).json({ error: "Unauthorized", message: "Refresh token expired or invalid" });
      return;
    }
    const accessToken = signAccessToken(decoded.userId);
    const newRefreshToken = signRefreshToken(decoded.userId);
    await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    res.cookie(refreshCookieName, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({
      user: {
        id: stored.user.id,
        email: stored.user.email,
        name: stored.user.name,
      },
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    });
  } catch {
    res.status(401).json({ error: "Unauthorized", message: "Invalid refresh token" });
  }
});

router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[refreshCookieName] ?? req.body?.refreshToken ?? req.headers["x-refresh-token"];
  if (token && typeof token === "string") {
    await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {});
  }
  res.clearCookie(refreshCookieName, { path: "/" });
  res.json({ success: true });
});

export default router;
