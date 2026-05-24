import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { createLote, getMisLotes } from "./lotes.controller";

const router = Router();

router.post("/", authMiddleware, requireRole("productor"), createLote);
router.get("/mis-lotes", authMiddleware, requireRole("productor"), getMisLotes);

export default router;