import { Router } from "express";
import { getMarketplaceLots } from "./marketplace.controller";

const router = Router();

router.get("/lotes", getMarketplaceLots);

export default router;