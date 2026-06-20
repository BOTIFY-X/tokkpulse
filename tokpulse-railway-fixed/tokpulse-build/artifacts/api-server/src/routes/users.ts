import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { UpdateMeBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const now = new Date();
  let plan = user.plan;
  let premiumExpiresAt = user.premiumExpiresAt;

  if (plan === "premium" && premiumExpiresAt) {
    const expiry = new Date(premiumExpiresAt);
    const gracePeriodEnd = new Date(expiry.getTime() + 3 * 24 * 60 * 60 * 1000);
    if (now > gracePeriodEnd) {
      plan = "free";
      await db.update(usersTable).set({ plan: "free" }).where(eq(usersTable.id, user.id));
    } else if (now > expiry) {
      plan = "grace";
      await db.update(usersTable).set({ plan: "grace" }).where(eq(usersTable.id, user.id));
    }
  }

  res.json({
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    displayName: user.displayName,
    country: user.country,
    currency: user.currency ?? "NGN",
    niche: user.niche,
    plan,
    premiumExpiresAt: premiumExpiresAt ? premiumExpiresAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  });
});

router.patch("/users/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { displayName, country, currency, niche } = parsed.data;
  const updates: Record<string, string> = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (country !== undefined) updates.country = country;
  if (currency !== undefined) updates.currency = currency;
  if (niche !== undefined) updates.niche = niche;

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
  res.json({
    id: updated.id,
    clerkId: updated.clerkId,
    email: updated.email,
    displayName: updated.displayName,
    country: updated.country,
    currency: updated.currency ?? "NGN",
    niche: updated.niche,
    plan: updated.plan,
    premiumExpiresAt: updated.premiumExpiresAt ? updated.premiumExpiresAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
