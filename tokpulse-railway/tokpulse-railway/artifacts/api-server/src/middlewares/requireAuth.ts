import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).clerkId = userId;

  let user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1);
  if (!user.length) {
    const email = (getAuth(req) as any).sessionClaims?.email ?? "";
    const [newUser] = await db.insert(usersTable).values({ clerkId: userId, email, plan: "free" }).returning();
    (req as any).dbUser = newUser;
  } else {
    (req as any).dbUser = user[0];
  }
  next();
}

export async function requirePremium(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = (req as any).dbUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const plan = user.plan;
  const premiumExpiresAt = user.premiumExpiresAt;

  if (plan === "free") {
    res.status(403).json({ error: "Premium subscription required" });
    return;
  }

  if (plan === "premium" && premiumExpiresAt) {
    const now = new Date();
    const expiry = new Date(premiumExpiresAt);
    const gracePeriodEnd = new Date(expiry.getTime() + 3 * 24 * 60 * 60 * 1000);
    if (now > gracePeriodEnd) {
      await db.update(usersTable).set({ plan: "free" }).where(eq(usersTable.id, user.id));
      res.status(403).json({ error: "Premium subscription expired" });
      return;
    }
    if (now > expiry) {
      await db.update(usersTable).set({ plan: "grace" }).where(eq(usersTable.id, user.id));
    }
  }

  next();
}
