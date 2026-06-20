import { Router } from "express";
import { db, paymentsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import path from "path";
import fs from "fs";

const router = Router();

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const uploadsDir = path.resolve(workspaceRoot, "artifacts/api-server/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.post("/payments/initiate", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const { currency } = req.body;

  const amount = currency === "USD" ? 1.00 : 1500.00;

  const [payment] = await db.insert(paymentsTable).values({
    userId: user.id,
    clerkId: user.clerkId,
    amount: String(amount),
    currency: currency ?? "NGN",
    status: "pending",
  }).returning();

  res.status(201).json({
    id: payment.id,
    status: payment.status,
    amount: parseFloat(payment.amount as string),
    currency: payment.currency,
    proofImageUrl: null,
    createdAt: payment.createdAt.toISOString(),
  });
});

router.post("/payments/upload-proof", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const { paymentId, proofImageBase64, fileName } = req.body;

  if (!paymentId || !proofImageBase64) {
    res.status(400).json({ error: "paymentId and proofImageBase64 are required" });
    return;
  }

  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.id, parseInt(paymentId))).limit(1);

  if (!payments.length || payments[0].userId !== user.id) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  const base64Data = proofImageBase64.replace(/^data:image\/\w+;base64,/, "");
  const ext = (fileName as string)?.split(".").pop() ?? "png";
  const savedFileName = `proof_${user.id}_${Date.now()}.${ext}`;
  const filePath = path.join(uploadsDir, savedFileName);
  fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

  const proofUrl = `/api/payments/proof/${savedFileName}`;

  const [updated] = await db.update(paymentsTable).set({
    status: "proof_submitted",
    proofImageUrl: proofUrl,
    proofFileName: fileName,
  }).where(eq(paymentsTable.id, parseInt(paymentId))).returning();

  res.json({
    id: updated.id,
    status: updated.status,
    amount: parseFloat(updated.amount as string),
    currency: updated.currency,
    proofImageUrl: updated.proofImageUrl,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.get("/payments/proof/:fileName", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.fileName) ? req.params.fileName[0] : req.params.fileName;
  const fileName = path.basename(raw);
  const filePath = path.join(uploadsDir, fileName);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.sendFile(filePath);
});

router.get("/payments/my-subscription", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;

  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.userId, user.id))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(1);

  const now = new Date();
  let status: string = "none";
  let daysRemaining: number | null = null;
  let plan = user.plan;
  let premiumExpiresAt = user.premiumExpiresAt;

  if (plan === "premium" && premiumExpiresAt) {
    const expiry = new Date(premiumExpiresAt);
    const gracePeriodEnd = new Date(expiry.getTime() + 3 * 24 * 60 * 60 * 1000);
    if (now > gracePeriodEnd) {
      status = "expired";
      plan = "free";
    } else if (now > expiry) {
      status = "grace_period";
      daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      status = "active";
      daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  } else if (plan === "grace") {
    status = "grace_period";
  } else {
    status = "none";
  }

  const latestPayment = payments.length ? {
    id: payments[0].id,
    status: payments[0].status,
    amount: parseFloat(payments[0].amount as string),
    currency: payments[0].currency,
    proofImageUrl: payments[0].proofImageUrl,
    createdAt: payments[0].createdAt.toISOString(),
  } : null;

  res.json({
    plan,
    status,
    expiresAt: premiumExpiresAt ? premiumExpiresAt.toISOString() : null,
    daysRemaining,
    latestPayment,
  });
});

export default router;
