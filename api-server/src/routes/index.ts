import { Router, type IRouter } from "express";
import healthRouter from "./health";
import askRouter from "./ask";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/ask', askRouter);
router.use('/ai', aiRouter);

export default router;
