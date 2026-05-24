"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketplace_controller_1 = require("./marketplace.controller");
const router = (0, express_1.Router)();
router.get("/lotes", marketplace_controller_1.getMarketplaceLots);
exports.default = router;
