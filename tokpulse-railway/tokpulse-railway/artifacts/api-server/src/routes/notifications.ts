import { Router } from "express";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/notifications/subscribe", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const { endpoint, p256dh, auth } = req.body;

  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({ error: "endpoint, p256dh, and auth are required" });
    return;
  }

  const existing = await db.select().from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, user.id)).limit(1);

  if (existing.length) {
    await db.update(pushSubscriptionsTable).set({ endpoint, p256dh, auth })
      .where(eq(pushSubscriptionsTable.userId, user.id));
  } else {
    await db.insert(pushSubscriptionsTable).values({ userId: user.id, endpoint, p256dh, auth });
  }

  res.json({ message: "Push notifications enabled" });
});

router.post("/notifications/unsubscribe", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.userId, user.id));
  res.json({ message: "Push notifications disabled" });
});

export default router;
