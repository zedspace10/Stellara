import { Router, type IRouter } from "express";
import healthRouter from "./health";
import askRouter from "./ask";
import aiRouter from "./ai";
import subscribeRouter from "./subscribe";

const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/ask', askRouter);
router.use('/ai', aiRouter);
router.use('/subscribe', subscribeRouter);

export default router;
