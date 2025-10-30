// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import xssClean from "xss-clean";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
// Remove cookieSession import since we're using manual cookies
import webhookRoutes from "./routes/webhook.route.js";

import { notFoundMiddleware, errorHandler } from "./middlewares/index.js";
import routes from "./routes/index.js";
import { env } from "./config/index.js";

const app = express();
app.set('trust proxy', 1);

/* --------------------  Optional API docs (dev only) -------------------- */
if (env.NODE_ENV !== "production") {
  try {
    const { initApiDocs } = await import("./docs/init-oas.js");
    const swaggerUi = (await import("swagger-ui-express")).default;
    const spec = (await import("./docs/openapi.json", { with: { type: "json" } })).default;

    initApiDocs(app);
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
    console.log("API docs enabled at /docs");
  } catch (err) {
    console.warn("Docs not available:", err.message);
  }
}

/* --------------------  Security / platform middlewares -------------------- */
const allowedOrigins = [
  env.CLIENT_URL,
  env.ADMIN_PANEL_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200, 
    preflightContinue: false,
  })
);


app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "http://localhost:5000"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:3000"],
        frameSrc: ["'self'", "http://localhost:5000"],
      },
    },
  })
);

app.use(xssClean());
app.use(cookieParser());

/* --------------------  Disable caching for API responses -------------------- */
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use("/api/v1/webhooks", webhookRoutes);

/* --------------------  Body parsers -------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* --------------------  Logger -------------------- */
if (env.NODE_ENV === "development") {
  try {
    const morgan = (await import("morgan")).default;
    app.use(morgan("dev"));
  } catch {
    console.warn("Morgan not installed; skipping logger");
  }
}


/* --------------------  Rate limiting -------------------- */
const limiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: Number(env.RATE_LIMIT_MAX_REQUESTS ?? 100),
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

/* --------------------  API routes -------------------- */
app.use("/api/v1", routes);


app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
}); 


/* --------------------  Error handlers -------------------- */
app.use(notFoundMiddleware);
app.use(errorHandler);

export default app;