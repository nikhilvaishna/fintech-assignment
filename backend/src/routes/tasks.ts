import { Router, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../db.js";

const router = Router();
router.use(authMiddleware);

const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("status").optional().isIn(statuses),
    query("search").optional().trim().isLength({ max: 200 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed", details: errors.array() });
      return;
    }
    const userId = (req as Request & { userId: string }).userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as (typeof statuses)[number] | undefined;
    const search = (req.query.search as string)?.trim();

    const where: { userId: string; status?: string; title?: { contains: string } } = {
      userId,
    };
    if (status) where.status = status;
    if (search) where.title = { contains: search };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

router.get(
  "/:id",
  [param("id").notEmpty().isString()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed", details: errors.array() });
      return;
    }
    const userId = (req as Request & { userId: string }).userId;
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!task) {
      res.status(404).json({ error: "Not found", message: "Task not found" });
      return;
    }
    res.json(task);
  }
);

router.post(
  "/",
  [
    body("title").trim().notEmpty().isLength({ max: 500 }).withMessage("Title required (max 500 chars)"),
    body("description").optional().trim().isLength({ max: 2000 }),
    body("status").optional().isIn(statuses),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed", details: errors.array() });
      return;
    }
    const userId = (req as Request & { userId: string }).userId;
    const { title, description, status } = req.body as {
      title: string;
      description?: string;
      status?: (typeof statuses)[number];
    };
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "PENDING",
        userId,
      },
    });
    res.status(201).json(task);
  }
);

router.patch(
  "/:id",
  [
    param("id").notEmpty().isString(),
    body("title").optional().trim().isLength({ max: 500 }),
    body("description").optional().trim().isLength({ max: 2000 }),
    body("status").optional().isIn(statuses),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed", details: errors.array() });
      return;
    }
    const userId = (req as Request & { userId: string }).userId;
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      res.status(404).json({ error: "Not found", message: "Task not found" });
      return;
    }
    const { title, description, status } = req.body as {
      title?: string;
      description?: string;
      status?: (typeof statuses)[number];
    };
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
    });
    res.json(task);
  }
);

router.delete(
  "/:id",
  [param("id").notEmpty().isString()],
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { userId: string }).userId;
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      res.status(404).json({ error: "Not found", message: "Task not found" });
      return;
    }
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }
);

router.post(
  "/:id/toggle",
  [param("id").notEmpty().isString()],
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { userId: string }).userId;
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      res.status(404).json({ error: "Not found", message: "Task not found" });
      return;
    }
    const nextStatus = existing.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: nextStatus },
    });
    res.json(task);
  }
);

export default router;
