import { Router } from "express";
import { db, paymentsTable, usersTable, tiktokAccountsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "katsonofficial001@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "#jesusfuckingchrist#";
const ADMIN_SECRET = process.env.SESSION_SECRET ?? "tokpulse-admin-secret";

router.post("/admin/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { email, name: "Katson", role: "admin" },
    ADMIN_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    token,
    admin: { email, name: "Katson" },
  });
});

router.get("/admin/payments/pending", requireAdmin, async (req, res): Promise<void> => {
  const payments = await db.select({
    id: paymentsTable.id,
    userId: paymentsTable.clerkId,
    amount: paymentsTable.amount,
    currency: paymentsTable.currency,
    status: paymentsTable.status,
    proofImageUrl: paymentsTable.proofImageUrl,
    createdAt: paymentsTable.createdAt,
    userEmail: usersTable.email,
    userName: usersTable.displayName,
  })
    .from(paymentsTable)
    .leftJoin(usersTable, eq(paymentsTable.userId, usersTable.id))
    .orderBy(paymentsTable.createdAt);

  res.json(payments.map(p => ({
    id: p.id,
    userId: p.userId,
    userEmail: p.userEmail ?? "",
    userName: p.userName,
    amount: parseFloat(p.amount as string),
    currency: p.currency,
    status: p.status,
    proofImageUrl: p.proofImageUrl,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/admin/payments/:paymentId/approve", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.paymentId) ? req.params.paymentId[0] : req.params.paymentId;
  const paymentId = parseInt(raw, 10);

  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.id, paymentId)).limit(1);

  if (!payments.length) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  await db.update(paymentsTable).set({
    status: "approved",
    approvedAt: new Date(),
  }).where(eq(paymentsTable.id, paymentId));

  const premiumExpiresAt = new Date();
  premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);

  await db.update(usersTable).set({
    plan: "premium",
    premiumExpiresAt,
  }).where(eq(usersTable.id, payments[0].userId));

  res.json({ message: "Payment approved and premium access granted" });
});

router.post("/admin/payments/:paymentId/reject", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.paymentId) ? req.params.paymentId[0] : req.params.paymentId;
  const paymentId = parseInt(raw, 10);

  await db.update(paymentsTable).set({
    status: "rejected",
    rejectedAt: new Date(),
  }).where(eq(paymentsTable.id, paymentId));

  res.json({ message: "Payment rejected" });
});

router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    clerkId: usersTable.clerkId,
    email: usersTable.email,
    displayName: usersTable.displayName,
    plan: usersTable.plan,
    premiumExpiresAt: usersTable.premiumExpiresAt,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.createdAt);

  const tiktokAccounts = await db.select({ userId: tiktokAccountsTable.userId }).from(tiktokAccountsTable);
  const connectedUserIds = new Set(tiktokAccounts.map(a => a.userId));

  res.json(users.map(u => ({
    id: u.id,
    clerkId: u.clerkId,
    email: u.email,
    displayName: u.displayName,
    plan: u.plan,
    premiumExpiresAt: u.premiumExpiresAt ? u.premiumExpiresAt.toISOString() : null,
    tiktokConnected: connectedUserIds.has(u.id),
    createdAt: u.createdAt.toISOString(),
  })));
});

router.post("/admin/users/:userId/toggle-premium", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = raw;
  const { premium, durationDays } = req.body;

  if (premium) {
    const days = durationDays ?? 30;
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + days);
    await db.update(usersTable).set({ plan: "premium", premiumExpiresAt })
      .where(eq(usersTable.clerkId, userId));
    res.json({ message: `Premium granted for ${days} days` });
  } else {
    await db.update(usersTable).set({ plan: "free", premiumExpiresAt: null })
      .where(eq(usersTable.clerkId, userId));
    res.json({ message: "Premium revoked" });
  }
});

router.get("/admin/stats", requireAdmin, async (req, res): Promise<void> => {
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [premiumUsers] = await db.select({ count: count() }).from(usersTable)
    .where(eq(usersTable.plan, "premium"));
  const [pendingPayments] = await db.select({ count: count() }).from(paymentsTable)
    .where(eq(paymentsTable.status, "proof_submitted"));
  const [approvedPayments] = await db.select({ count: count() }).from(paymentsTable)
    .where(eq(paymentsTable.status, "approved"));

  const revenueResult = await db.select({
    total: sql<string>`COALESCE(SUM(amount), 0)`,
  }).from(paymentsTable).where(eq(paymentsTable.status, "approved"));

  res.json({
    totalUsers: Number(totalUsers.count),
    premiumUsers: Number(premiumUsers.count),
    freeUsers: Number(totalUsers.count) - Number(premiumUsers.count),
    pendingPayments: Number(pendingPayments.count),
    approvedPayments: Number(approvedPayments.count),
    totalRevenue: parseFloat(revenueResult[0]?.total ?? "0"),
  });
});

export default router;
