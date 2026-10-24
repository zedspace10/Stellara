import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subscribeRouter from "./subscribe";

const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/subscribe', subscribeRouter);

export default router;
