"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const profiles_routes_1 = __importDefault(require("./modules/profiles/profiles.routes"));
const marketplace_routes_1 = __importDefault(require("./modules/marketplace/marketplace.routes"));
const lotes_routes_1 = __importDefault(require("./modules/lotes-fibra/lotes.routes"));
const solicitudes_routes_1 = __importDefault(require("./modules/solicitudes-compra/solicitudes.routes"));
const precios_routes_1 = __importDefault(require("./modules/precios/precios.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.get("/", (_req, res) => {
    res.json({ message: "API AlpaTrace funcionando" });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/profiles", profiles_routes_1.default);
app.use("/api/marketplace", marketplace_routes_1.default);
app.use("/api/lotes", lotes_routes_1.default);
app.use("/api/solicitudes", solicitudes_routes_1.default);
app.use("/api/precios", precios_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
exports.default = app;
