// controllers/analysis.controller.js
import { db } from "../db/connect.js";
import { categories } from "../schema/category.js";
import { env } from "../config/env.config.js";
import { eq } from "drizzle-orm";
import fetch from "node-fetch";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_API_KEY = env.GROK_API_KEY;

console.log(" GROK_API_KEY loaded:", GROK_API_KEY);


export const analyzeCategory = async (req, res) => {
  try {
    const { categoryId, region } = req.body;
    console.log("🔹 Incoming Analysis Request:", { categoryId, region });

    if (!categoryId || !region) {
      return res.status(400).json({ message: "categoryId and region are required." });
    }

    //  Fetch category + prompt from DB
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId));

    if (!category) {
      console.warn(" Category not found:", categoryId);
      return res.status(404).json({ message: "Category not found" });
    }

    // Replace {market} or placeholders dynamically
    let aiPrompt = category.ai_prompt;
    aiPrompt = aiPrompt.replace("{market}", region);

    console.log(` Using AI Prompt for ${category.name} (${region})`);

    //  Construct final Grok request
    const payload = {
      model: "grok-2", // Confirm in x.ai docs
      messages: [
        {
          role: "system",
          content: "You are an expert AI product research assistant that generates profitable eCommerce product ideas.",
        },
        {
          role: "user",
          content: aiPrompt,
        },
      ],
    };

    //  Send request to Grok
    console.log(" Sending request to Grok...");
    const response = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(" Grok API Status:", response.status, response.statusText);

    //  Handle Grok API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(" Grok API Error Response:", errorText);
      return res.status(response.status).json({
        message: "Grok API request failed",
        error: errorText,
      });
    }

    //  Parse Grok response safely
    const result = await response.json();
    console.log(" Grok Response:", JSON.stringify(result, null, 2));

    const insights = result?.choices?.[0]?.message?.content?.trim();

    if (!insights) {
      console.warn(" No insights returned by Grok.");
      return res.status(204).json({
        message: "No insights generated.",
        rawResponse: result,
      });
    }

    //  Return structured output
    res.json({
      success: true,
      category: category.name,
      region,
      insights,
      model: result.model,
      usage: result.usage,
    });

  } catch (error) {
    console.error(" Error analyzing category:", error);
    res.status(500).json({
      message: "Analysis failed",
      error: error.message,
      stack: error.stack,
    });
  }
};
