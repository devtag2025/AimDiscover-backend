import { Router } from "express";
import { analyzeCategory, get3DModelStatus } from "../controllers/analysis.controller.js";

const router = Router();

router.post("/", analyzeCategory);
router.get("/3d-status/:taskId", get3DModelStatus); 

export default router;