// server.js
import "express-async-errors";
import app from "./app.js";
import { env } from "./config/index.js";
import StartupService from "./services/startup.service.js";

await StartupService.initialize(app, env);