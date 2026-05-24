"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const profiles_controller_1 = require("./profiles.controller");
const router = (0, express_1.Router)();
router.get("/me", auth_middleware_1.authMiddleware, profiles_controller_1.getMyProfile);
router.put("/me", auth_middleware_1.authMiddleware, profiles_controller_1.updateMyProfile);
exports.default = router;
