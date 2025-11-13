import db from "../db/connect.js";
import { categories } from "../schema/category.js";
import { meshyTasks } from "../schema/meshy-tasks.js";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { env } from "../config/env.config.js";

const GROK_API_KEY = process.env.GROK_API_KEY;
const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_API_URL = "https://api.meshy.ai/v2/text-to-3d";
const MESHY_WEBHOOK_SECRET = env.MESHY_WEBHOOK_SECRET
const NGROK_SERVER = env.NGROK_SERVER
console.log("✅ Environment Variables Loaded:");
console.log("   - GROK_API_KEY:", !!GROK_API_KEY);
console.log("   - MESHY_API_KEY:", !!MESHY_API_KEY);
console.log("   - MESHY_WEBHOOK_SECRET:", !!MESHY_WEBHOOK_SECRET);
console.log("   - NGROK_URL:", !!NGROK_SERVER);

// Helper function to shorten text for Meshy (max 400 chars)
function shortenForMeshy(text, maxLength = 400) {
  if (!text) return "";
  
  if (text.length <= maxLength) {
    return text;
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let shortened = "";
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if ((shortened + trimmed).length <= maxLength - 3) {
      shortened += (shortened ? ". " : "") + trimmed;
    } else {
      break;
    }
  }

  return shortened || text.substring(0, maxLength - 3) + "...";
}

export async function fetchFinal3DModel(taskId) {
  try {
    const response = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
      headers: { "Authorization": `Bearer ${process.env.MESHY_API_KEY}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch final model: ${errorText}`);
    }

    const result = await response.json();
    const data = result.data || result;

    await db.update(meshyTasks)
      .set({
        status: "COMPLETED",
        progress: 100,
        modelUrls: JSON.stringify({
          glb: data.glb_url,
          usdz: data.usdz_url,
        }),
        thumbnailUrl: data.thumbnail_url,
        videoUrl: data.video_url,
        finishedAt: new Date(),
      })
      .where(eq(meshyTasks.taskId, taskId));

    console.log("✅ Final model stored for task:", taskId);
    return data;

  } catch (err) {
    console.error("❌ fetchFinal3DModel error:", err.message);
    await db.update(meshyTasks)
      .set({
        status: "FAILED",
        taskError: err.message,
      })
      .where(eq(meshyTasks.taskId, taskId));
    throw err;
  }
}

// Debug-ready Meshy webhook handler



// Generate 3D Model with Meshy API send the request to Meshy along with payload URl
async function generate3DModelWithMeshy(productDescription, artStyle = "realistic") {
  try {
    console.log("\n🎨 === GENERATING 3D MODEL ===");
    console.log("📝 Original description length:", productDescription.length);

    const meshyPrompt = shortenForMeshy(productDescription);
    console.log("📝 Shortened prompt length:", meshyPrompt.length);
    console.log("💬 Meshy prompt:", meshyPrompt);

    const createPayload = {
      prompt: meshyPrompt,
      art_style: artStyle,
      negative_prompt: "low quality, blurry, distorted, malformed",
      ai_model: "meshy-4",
      mode: "preview",
      webhook_url: `${env.NGROK_SERVER}/api/v1/webhook/meshy`,
    };

    console.log("📤 Creating Meshy task...");

    const createResponse = await fetch(MESHY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MESHY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createPayload),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error("❌ Meshy API Create Error:", createResponse.status, error);
      return {
        error: "Meshy API create failed",
        status: createResponse.status,
        details: error,
        fallback: true,
      };
    }

    const createResult = await createResponse.json();
    const taskId = createResult.result;

    console.log("✅ Meshy task created successfully!");
    console.log("🆔 Task ID:", taskId);

    // 💾 Store task in database
    const newTask = await db.insert(meshyTasks).values({
      id: createId(),
      taskId,
      status: "PENDING",
      progress: 0,
      prompt: meshyPrompt,
      artStyle,
      createdAt: new Date()
    }).returning();

    console.log("✅ Task stored in database with ID:", newTask[0].id);

    return {
      success: true,
      message: "3D model generation task created. Webhook will update when ready.",
      taskId,
      prompt: meshyPrompt,
      artStyle,
      status: "PENDING",
      progress: 0
    };

  } catch (error) {
    console.error("❌ Error generating 3D model:", error.message);
    console.error("Stack:", error.stack);
    return {
      error: "Exception in 3D generation",
      message: error.message,
      fallback: true,
    };
  }
}

// Analyze Category with Grok AI
async function analyzeWithGrok(categoryName, region, productName = null) {
  try {
    console.log("\n🤖 === CALLING GROK API ===");
    console.log("📝 Category:", categoryName);
    console.log("🌍 Region:", region);
    console.log("🏷️ Product:", productName || "Not specified");

    let prompt = `You are an expert product analyst. Analyze the "${categoryName}" category in the "${region}" region.`;

    if (productName) {
      prompt += ` Focus specifically on: "${productName}".`;
    }

    prompt += `

Provide a detailed physical description including:
- Exact dimensions (length, width, height)
- Materials and build quality
- Colors and finishes
- Design characteristics
- Key visual features

Write in plain English paragraphs. Focus on physical and visual attributes that would help create a 3D model.`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a product description writer. Write detailed, natural descriptions focusing on physical appearance, dimensions, materials, colors, and features. Write in plain English paragraphs, not JSON or lists.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "grok-2-latest",
        max_tokens: 1000,
        stream: false,
        temperature: 0.7,
      }),
    });

    console.log("📡 Grok API Status:", response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Grok API Error:", response.status, error);
      throw new Error(`Grok API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || "No analysis generated";
    
    console.log("✅ Grok Response received");
    console.log("📄 Description length:", analysisText.length);
    console.log("📄 First 200 chars:", analysisText.substring(0, 200) + "...");

    return {
      success: true,
      analysis: analysisText,
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    console.error("❌ Error calling Grok API:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  }
}

// Main Analysis Controller
export async function analyzeCategory(req, res) {
  try {
    const { categoryId, region, productName, artStyle = "realistic" } = req.body;

    console.log("\n🎯 === NEW ANALYSIS REQUEST ===");
    console.log("📦 Category ID:", categoryId);
    console.log("🌍 Region:", region);
    console.log("🏷️ Product Name:", productName || "Not specified");
    console.log("🎨 Art Style:", artStyle);

    if (!categoryId || !region) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Category ID and region are required",
      });
    }

    // Get category details
    console.log("🔍 Fetching category from database...");
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!category) {
      console.error("❌ Category not found:", categoryId);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    console.log("✅ Category found:", category.name);

    // Step 1: Get AI analysis from Grok
    const grokResult = await analyzeWithGrok(category.name, region, productName);

    if (!grokResult.success) {
      console.error("❌ Grok analysis failed");
      return res.status(500).json({
        success: false,
        message: "Failed to generate analysis",
      });
    }

    // Step 2: Generate 3D model with Meshy
    const model3DResult = await generate3DModelWithMeshy(
      grokResult.analysis,
      artStyle
    );

    console.log("\n✅ === ANALYSIS COMPLETE ===");
    console.log("📊 Grok analysis:", grokResult.success ? "✓" : "✗");
    console.log("🎨 3D model task:", model3DResult.success ? "✓" : "✗");
    console.log("🆔 Task ID:", model3DResult.taskId);

    // Return response immediately
    return res.status(200).json({
      success: true,
      message: "Analysis completed. 3D model generation started.",
      insights: grokResult.analysis,
      model3D: model3DResult,
      metadata: {
        category: category.name,
        region,
        productName: productName || category.name,
        timestamp: new Date().toISOString(),
        grokModel: grokResult.model,
      },
    });

  } catch (error) {
    console.error("\n❌ === ANALYSIS ERROR ===");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error during analysis",
      error: error.message,
    });
  }
}

// Get 3D Model Status endpoint - FIXED TO PARSE JSON
export async function get3DModelStatus(req, res) {
  try {
    const { taskId } = req.params;

    console.log("\n🔍 === CHECKING TASK STATUS ===");
    console.log("🆔 Task ID:", taskId);

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    // Query the database
    const [task] = await db
      .select()
      .from(meshyTasks)
      .where(eq(meshyTasks.taskId, taskId))
      .limit(1);

      console.log(task)

    if (!task) {
      console.log("❌ Task not found");
      return res.status(404).json({ error: "Task not found" });
    }

    console.log("📊 Status:", task.status);
    console.log("📈 Progress:", task.progress);
    console.log("🔗 Has modelUrls in DB:", !!task.modelUrls);
    console.log("🔗 Raw modelUrls:", task.modelUrls);

    // Parse modelUrls if it's a JSON string
    let modelUrls = null;
    if (task.modelUrls) {
      try {
        modelUrls = typeof task.modelUrls === 'string' 
          ? JSON.parse(task.modelUrls) 
          : task.modelUrls;
        console.log("✅ Parsed modelUrls:", Object.keys(modelUrls));
      } catch (e) {
        console.error("❌ Failed to parse modelUrls:", e);
      }
    }

    return res.status(200).json({
      taskId: task.taskId,
      status: task.status,
      progress: task.progress,
      modelUrls: modelUrls, // Parsed JSON object
      thumbnailUrl: task.thumbnailUrl,
      videoUrl: task.videoUrl,
      taskError: task.taskError,
      prompt: task.prompt,
      artStyle: task.artStyle,
      createdAt: task.createdAt,
      finishedAt: task.finishedAt
    });

  } catch (error) {
    console.error("\n❌ === STATUS CHECK ERROR ===");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}