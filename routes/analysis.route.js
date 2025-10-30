// routes/analysis.js
import express from "express";
import { analyzeCategory } from "../controllers/analysis.controller.js";
const router = express.Router();

router.post("/", analyzeCategory);
export default router;
