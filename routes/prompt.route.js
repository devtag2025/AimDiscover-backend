import { auth } from "../middlewares/auth.middleware.js";
import { promptController } from "../controllers/prompt.controller.js";
import { Router } from "express";
const router = Router();

router.use(auth);

router.get("/:key",promptController.getPrompt);
router.post("/",promptController.savePrompt)

export default router;