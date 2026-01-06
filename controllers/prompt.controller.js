import { promptService } from "../services/prompt.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
export const promptController = {
  async savePrompt(req, res, next) {
    try {
      const { key, content } = req.body;
console.log(key);
      if (!key || !content) {
        return res
          .status(400)
          .json({ success: false, message: "Key and content are required" });
      }

      const savedPrompt = await promptService.savePrompt({ key, content });
      res.json(new ApiResponse(201, savedPrompt, "Prompt saved successfully"));
    } catch (error) {
      next(new ApiError(500, "Failed saving master prompt", error.message));
    }
  },

  async getPrompt(req, res, next) {
    try {
      const { key } = req.params;
      console.log(key);
      const prompt = await promptService.getPrompt(key);

      res.json(new ApiResponse(201, prompt, "Prompt retreive successfully"));
    } catch (error) {
      next(new ApiError(500, "Failed retreving master prompt", error.message));
    }
  },
};
