import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import tiktokRouter from "./tiktok";
import analyticsRouter from "./analytics";
import paymentsRouter from "./payments";
import aiRouter from "./ai";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(tiktokRouter);
router.use(analyticsRouter);
router.use(paymentsRouter);
router.use(aiRouter);
router.use(notificationsRouter);
router.use(adminRouter);

export default router;
