import { Router, type IRouter } from "express";
import healthRouter from "./health";
import askRouter from "./ask";
import aiRouter from "./ai";
import subscribeRouter from "./subscribe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(askRouter);
router.use(aiRouter);
router.use(subscribeRouter);

export default router;
