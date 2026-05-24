import express from "express";
import cors from "cors";
import morgan from "morgan";

import marketplaceRoutes from "./modules/marketplace/marketplace.routes";
import lotesRoutes from "./modules/lotes-fibra/lotes.routes";
import solicitudesRoutes from "./modules/solicitudes-compra/solicitudes.routes";
import preciosRoutes from "./modules/precios/precios.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    message: "API AlpaTrace funcionando",
  });
});

app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/lotes", lotesRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/precios", preciosRoutes);
app.use("/api/admin", adminRoutes);

export default app;