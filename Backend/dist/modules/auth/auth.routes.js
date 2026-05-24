"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.get("/me", auth_middleware_1.verifyToken, auth_controller_1.getMe);
router.post("/profile", auth_middleware_1.verifyToken, auth_controller_1.createProfile);
exports.default = router;
