
// import { db } from "../db/connect.js";
// import { categories } from "../schema/category.js";
// import { env } from "../config/env.config.js";
// import { eq } from "drizzle-orm";
// import fetch from "node-fetch";

// const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
// const GROK_API_KEY = env.GROK_API_KEY;
// const MESHY_API_KEY = env.MESHY_API_KEY;
// const MESHY_API_URL = "https://api.meshy.ai/v2/text-to-3d";

// console.log("✅ GROK_API_KEY loaded:", !!GROK_API_KEY);
// console.log("✅ MESHY_API_KEY loaded:", !!MESHY_API_KEY);

// /**
//  * Shorten product description for Meshy API (max 500 chars)
//  */
// function shortenForMeshy(description) {
//   if (!description) return "A modern product";
  
//   // Remove extra whitespace and newlines
//   let cleaned = description
//     .replace(/\n+/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
  
//   // If already short enough, return as is
//   if (cleaned.length <= 500) {
//     return cleaned;
//   }
  
//   // Take first 480 chars and try to end at sentence
//   let shortened = cleaned.substring(0, 480);
//   const lastPeriod = shortened.lastIndexOf(".");
//   const lastComma = shortened.lastIndexOf(",");
  
//   if (lastPeriod > 300) {
//     shortened = shortened.substring(0, lastPeriod + 1);
//   } else if (lastComma > 300) {
//     shortened = shortened.substring(0, lastComma);
//   }
  
//   return shortened.trim();
// }

// /**
//  * Generate 3D model using Meshy API
//  */
// async function generate3DModelWithMeshy(productDescription, artStyle = "realistic") {
//   try {
//     console.log("🎨 Generating 3D model with Meshy API...");
//     console.log("📝 Original description length:", productDescription.length);

//     // Shorten the description for Meshy
//     const meshyPrompt = shortenForMeshy(productDescription);
//     console.log("📝 Shortened prompt length:", meshyPrompt.length);
//     console.log("💬 Meshy prompt:", meshyPrompt);

//     // Create the 3D generation task
//     const createPayload = {
//       prompt: meshyPrompt,
//       art_style: artStyle,
//       negative_prompt: "low quality, blurry, distorted, malformed",
//       ai_model: "meshy-4",
//       mode: "preview"
//     };

//     console.log("📤 Creating Meshy task...");

//     const createResponse = await fetch(MESHY_API_URL, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${MESHY_API_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(createPayload)
//     });

//     if (!createResponse.ok) {
//       const error = await createResponse.text();
//       console.error("❌ Meshy API Create Error:", error);
//       return {
//         error: "Meshy API create failed",
//         status: createResponse.status,
//         details: error,
//         fallback: true
//       };
//     }

//     const createResult = await createResponse.json();
//     const taskId = createResult.result;
//     console.log("✅ Meshy task created, Task ID:", taskId);

//     // 🔔 Option 2: Use setTimeout for delayed status check (2 minutes)
//     setTimeout(async () => {
//       console.log("⏳ Fetching Meshy model status after 2 minutes...");
//       try {
//         const statusResponse = await fetch(`${MESHY_API_URL}/${taskId}`, {
//           headers: { "Authorization": `Bearer ${MESHY_API_KEY}` }
//         });

//         if (!statusResponse.ok) {
//           const error = await statusResponse.text();
//           console.error("❌ Failed to fetch task status:", error);
//           return;
//         }

//         const taskResult = await statusResponse.json();
//         console.log("🔔 Meshy task status:", taskResult.status);

//         if (taskResult.status === "SUCCEEDED") {
//           const glbUrl = taskResult.model_urls?.glb;
//           console.log("✅ GLB ready:", glbUrl);
//           // You can trigger further logic here, e.g., update your UI
//         } else if (taskResult.status === "FAILED") {
//           console.error("❌ Meshy task failed:", taskResult.task_error);
//         } else {
//           console.warn("⚠️ Model still processing. Check again later.");
//         }

//       } catch (err) {
//         console.error("❌ Error fetching Meshy model status:", err);
//       }
//     }, 120000); // 2 minutes delay (120000 ms)

//     // Return immediately with task info
//     return {
//       success: true,
//       message: "3D model task created. Status will be checked automatically after 2 minutes.",
//       taskId,
//       prompt: meshyPrompt,
//       artStyle
//     };

//   } catch (error) {
//     console.error("❌ Error generating 3D model with Meshy:", error);
//     return {
//       error: "Exception in 3D generation",
//       message: error.message,
//       fallback: true
//     };
//   }
// }


// // Main analysis endpoint
// export const analyzeCategory = async (req, res) => {
//   try {
//     const { categoryId, region, productName, artStyle } = req.body;
//     console.log("🔹 Incoming Analysis Request:", { categoryId, region, productName, artStyle });

//     if (!categoryId || !region) {
//       return res.status(400).json({ message: "categoryId and region are required." });
//     }

//     // 1️⃣ Fetch category from DB
//     const [category] = await db
//       .select()
//       .from(categories)
//       .where(eq(categories.id, categoryId));

//     if (!category) {
//       console.warn("⚠️ Category not found:", categoryId);
//       return res.status(404).json({ message: "Category not found" });
//     }

//     // 2️⃣ Build Simplified Grok Prompt (plain text description only)
//     let aiPrompt;
    
//     if (productName) {
//       aiPrompt = `Provide a detailed product description for: "${productName}"

// Market: ${region}
// Category: ${category.name}

// Write a comprehensive, natural description covering:
// - Product type and purpose
// - Physical dimensions and size
// - Materials and build quality
// - Colors and finishes
// - Key features and components
// - Design characteristics

// Write in plain English as a flowing description, not as a structured list. Focus on visual and physical attributes that would help create a 3D model.`;
//     } else {
//       aiPrompt = category.ai_prompt.replace("{market}", region);
//       aiPrompt += `

// Write a natural, detailed product description (not JSON, not a list) that covers the physical appearance, dimensions, materials, colors, and key features. Focus on visual characteristics.`;
//     }

//     console.log(`📝 Sending prompt to Grok for ${productName || category.name}`);

//     // 3️⃣ Call Grok API
//     const grokPayload = {
//       model: "grok-2-latest",
//       messages: [
//         {
//           role: "system",
//           content: "You are a product description writer. Write detailed, natural descriptions of products focusing on their physical appearance, dimensions, materials, colors, and features. Write in plain English paragraphs, not JSON or structured lists. Be specific and visual in your descriptions."
//         },
//         {
//           role: "user",
//           content: aiPrompt
//         }
//       ],
//       temperature: 0.7,
//       max_tokens: 1000
//     };

//     console.log("🤖 Sending request to Grok...");
//     const grokResponse = await fetch(GROK_API_URL, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${GROK_API_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(grokPayload)
//     });

//     console.log("📡 Grok API Status:", grokResponse.status);

//     if (!grokResponse.ok) {
//       const errorText = await grokResponse.text();
//       console.error("❌ Grok API Error:", errorText);
//       return res.status(grokResponse.status).json({
//         message: "Grok API request failed",
//         error: errorText
//       });
//     }

//     const grokResult = await grokResponse.json();
//     const productDescription = grokResult?.choices?.[0]?.message?.content?.trim();

//     if (!productDescription) {
//       console.warn("⚠️ No description returned by Grok.");
//       return res.status(204).json({
//         message: "No description generated.",
//         rawResponse: grokResult
//       });
//     }

//     console.log("✅ Grok Response received");
//     console.log("📄 Description length:", productDescription.length);
//     console.log("📄 First 300 chars:", productDescription.substring(0, 300));

//     // 4️⃣ Generate 3D model with Meshy API
//     console.log("🎨 Starting 3D model generation...");
//     const model3D = await generate3DModelWithMeshy(
//       productDescription, 
//       artStyle || "realistic"
//     );

//     // 5️⃣ Return combined response
//     res.json({
//       success: true,
//       category: category.name,
//       region,
//       productName: productName || category.name,
//       insights: productDescription,
//       model3D,
//       metadata: {
//         grokModel: grokResult.model,
//         usage: grokResult.usage,
//         timestamp: new Date().toISOString(),
//         has3DModel: model3D?.success === true,
//         meshyTaskId: model3D?.taskId,
//         generationStatus: model3D?.status
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error analyzing category:", error);
//     res.status(500).json({
//       message: "Analysis failed",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };



// // controllers/analysis.controller.js
// import { db } from "../db/connect.js";
// import { categories } from "../schema/category.js";
// import { meshyTasks } from "../schema/meshy-tasks.js";
// import { env } from "../config/env.config.js";
// import { eq } from "drizzle-orm";
// import fetch from "node-fetch";
// import { createId } from "@paralleldrive/cuid2";


// const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
// const GROK_API_KEY = env.GROK_API_KEY;
// const MESHY_API_KEY = env.MESHY_API_KEY;
// const MESHY_API_URL = "https://api.meshy.ai/v2/text-to-3d";

// console.log("✅ GROK_API_KEY loaded:", !!GROK_API_KEY);
// console.log("✅ MESHY_API_KEY loaded:", !!MESHY_API_KEY);

// /**
//  * Shorten product description for Meshy API (max 500 chars)
//  */
// function shortenForMeshy(description) {
//   if (!description) return "A modern product";
  
//   let cleaned = description
//     .replace(/\n+/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
  
//   if (cleaned.length <= 500) {
//     return cleaned;
//   }
  
//   let shortened = cleaned.substring(0, 480);
//   const lastPeriod = shortened.lastIndexOf(".");
//   const lastComma = shortened.lastIndexOf(",");
  
//   if (lastPeriod > 300) {
//     shortened = shortened.substring(0, lastPeriod + 1);
//   } else if (lastComma > 300) {
//     shortened = shortened.substring(0, lastComma);
//   }
  
//   return shortened.trim();
// }

// /**
//  * Generate 3D model using Meshy API and store in database
//  */
// // async function generate3DModelWithMeshy(productDescription, artStyle = "realistic") {
// //   try {
// //     console.log("🎨 Generating 3D model with Meshy API...");
// //     console.log("📝 Original description length:", productDescription.length);

// //     const meshyPrompt = shortenForMeshy(productDescription);
// //     console.log("📝 Shortened prompt length:", meshyPrompt.length);
// //     console.log("💬 Meshy prompt:", meshyPrompt);

// //     const createPayload = {
// //       prompt: meshyPrompt,
// //       art_style: artStyle,
// //       negative_prompt: "low quality, blurry, distorted, malformed",
// //       ai_model: "meshy-4",
// //       mode: "preview"
// //     };

// //     console.log("📤 Creating Meshy task...");

// //     const createResponse = await fetch(MESHY_API_URL, {
// //       method: "POST",
// //       headers: {
// //         "Authorization": `Bearer ${MESHY_API_KEY}`,
// //         "Content-Type": "application/json"
// //       },
// //       body: JSON.stringify(createPayload)
// //     });

// //     if (!createResponse.ok) {
// //       const error = await createResponse.text();
// //       console.error("❌ Meshy API Create Error:", error);
// //       return {
// //         error: "Meshy API create failed",
// //         status: createResponse.status,
// //         details: error,
// //         fallback: true
// //       };
// //     }

// //     const createResult = await createResponse.json();
// //     const taskId = createResult.result;
// //     console.log("✅ Meshy task created, Task ID:", taskId);

// //     // 💾 Store task in database
// //     await db.insert(meshyTasks).values({

// //         id: createId(),  
// //       taskId,
// //       status: "PENDING",
// //       progress: 0,
// //       prompt: meshyPrompt,
// //       artStyle,
// //       createdAt: new Date()
// //     });

// //     console.log("✅ Task stored in database");

// //     return {
// //       success: true,
// //       taskId,
// //       status: "PENDING",
// //       progress: 0,
// //       prompt: meshyPrompt,
// //       artStyle,
// //       message: "3D model generation started. Check status endpoint for updates."
// //     };

// //   } catch (error) {
// //     console.error("❌ Error generating 3D model with Meshy:", error);
// //     return {
// //       error: "Exception in 3D generation",
// //       message: error.message,
// //       fallback: true
// //     };
// //   }
// // }


// // async function generate3DModelWithMeshy(productDescription, artStyle = "realistic") {
// //   try {
// //     console.log("🎨 Generating 3D model with Meshy API...");
// //     console.log("📝 Original description length:", productDescription.length);

// //     // Shorten the description for Meshy
// //     const meshyPrompt = shortenForMeshy(productDescription);
// //     console.log("📝 Shortened prompt length:", meshyPrompt.length);
// //     console.log("💬 Meshy prompt:", meshyPrompt);

// //     // Create the 3D generation task (no polling)
// //     const createPayload = {
// //       prompt: meshyPrompt,
// //       art_style: artStyle,
// //       negative_prompt: "low quality, blurry, distorted, malformed",
// //       ai_model: "meshy-4",
// //       mode: "preview",
// //     };

// //     console.log("📤 Creating Meshy task...");

// //     const createResponse = await fetch(MESHY_API_URL, {
// //       method: "POST",
// //       headers: {
// //         "Authorization": `Bearer ${MESHY_API_KEY}`,
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(createPayload),
// //     });

// //     if (!createResponse.ok) {
// //       const error = await createResponse.text();
// //       console.error("❌ Meshy API Create Error:", error);
// //       return {
// //         error: "Meshy API create failed",
// //         status: createResponse.status,
// //         details: error,
// //         fallback: true,
// //       };
// //     }

// //     const createResult = await createResponse.json();
// //     const taskId = createResult.result; // The returned task ID

// //     console.log("✅ Meshy task created successfully!");
// //     console.log("🆔 Task ID:", taskId);

// //     // Return only task details — no polling
// //     return {
// //       success: true,
// //       message: "3D model generation task created successfully. Fetch status later using taskId.",
// //       taskId,
// //       prompt: meshyPrompt,
// //       artStyle,
// //     };

// //   } catch (error) {
// //     console.error("❌ Error generating 3D model with Meshy:", error);
// //     return {
// //       error: "Exception in 3D generation",
// //       message: error.message,
// //       fallback: true,
// //     };
// //   }
// // }

// async function generate3DModelWithMeshy(productDescription, artStyle = "realistic") {
//   try {
//     console.log("🎨 Generating 3D model with Meshy API...");
//     console.log("📝 Original description length:", productDescription.length);

//     const meshyPrompt = shortenForMeshy(productDescription);
//     console.log("📝 Shortened prompt length:", meshyPrompt.length);
//     console.log("💬 Meshy prompt:", meshyPrompt);

//     const createPayload = {
//       prompt: meshyPrompt,
//       art_style: artStyle,
//       negative_prompt: "low quality, blurry, distorted, malformed",
//       ai_model: "meshy-4",
//       mode: "preview",
//     };

//     console.log("📤 Creating Meshy task...");

//     const createResponse = await fetch(MESHY_API_URL, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${MESHY_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(createPayload),
//     });

//     if (!createResponse.ok) {
//       const error = await createResponse.text();
//       console.error("❌ Meshy API Create Error:", error);
//       return {
//         error: "Meshy API create failed",
//         status: createResponse.status,
//         details: error,
//         fallback: true,
//       };
//     }

//     const createResult = await createResponse.json();
//     const taskId = createResult.result;

//     console.log("✅ Meshy task created successfully!");
//     console.log("🆔 Task ID:", taskId);

//     // 💾 Store task in database
//     await db.insert(meshyTasks).values({
//       id: createId(),
//       taskId,
//       status: "PENDING",
//       progress: 0,
//       prompt: meshyPrompt,
//       artStyle,
//       createdAt: new Date()
//     });

//     console.log("✅ Task stored in database");

//     return {
//       success: true,
//       message: "3D model generation task created successfully. Webhook will update when ready.",
//       taskId,
//       prompt: meshyPrompt,
//       artStyle,
//       status: "PENDING",
//       progress: 0
//     };

//   } catch (error) {
//     console.error("❌ Error generating 3D model with Meshy:", error);
//     return {
//       error: "Exception in 3D generation",
//       message: error.message,
//       fallback: true,
//     };
//   }
// }

// /**
//  * Main analysis endpoint
//  */
// export const analyzeCategory = async (req, res) => {
//   try {
//     const { categoryId, region, productName, artStyle } = req.body;
//     console.log("🔹 Incoming Analysis Request:", { categoryId, region, productName, artStyle });

//     if (!categoryId || !region) {
//       return res.status(400).json({ message: "categoryId and region are required." });
//     }

//     // 1️⃣ Fetch category from DB
//     const [category] = await db
//       .select()
//       .from(categories)
//       .where(eq(categories.id, categoryId));

//     if (!category) {
//       console.warn("⚠️ Category not found:", categoryId);
//       return res.status(404).json({ message: "Category not found" });
//     }

//     // 2️⃣ Build Grok Prompt
//     let aiPrompt;
    
//     if (productName) {
//       aiPrompt = `Provide a detailed product description for: "${productName}"

// Market: ${region}
// Category: ${category.name}

// Write a comprehensive, natural description covering:
// - Product type and purpose
// - Physical dimensions and size
// - Materials and build quality
// - Colors and finishes
// - Key features and components
// - Design characteristics

// Write in plain English as a flowing description, not as a structured list. Focus on visual and physical attributes that would help create a 3D model.`;
//     } else {
//       aiPrompt = category.ai_prompt.replace("{market}", region);
//       aiPrompt += `

// Write a natural, detailed product description (not JSON, not a list) that covers the physical appearance, dimensions, materials, colors, and key features. Focus on visual characteristics.`;
//     }

//     console.log(`📝 Sending prompt to Grok for ${productName || category.name}`);

//     // 3️⃣ Call Grok API
//     const grokPayload = {
//       model: "grok-2-latest",
//       messages: [
//         {
//           role: "system",
//           content: "You are a product description writer. Write detailed, natural descriptions of products focusing on their physical appearance, dimensions, materials, colors, and features. Write in plain English paragraphs, not JSON or structured lists. Be specific and visual in your descriptions."
//         },
//         {
//           role: "user",
//           content: aiPrompt
//         }
//       ],
//       temperature: 0.7,
//       max_tokens: 1000
//     };

//     console.log("🤖 Sending request to Grok...");
//     const grokResponse = await fetch(GROK_API_URL, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${GROK_API_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(grokPayload)
//     });

//     console.log("📡 Grok API Status:", grokResponse.status);

//     if (!grokResponse.ok) {
//       const errorText = await grokResponse.text();
//       console.error("❌ Grok API Error:", errorText);
//       return res.status(grokResponse.status).json({
//         message: "Grok API request failed",
//         error: errorText
//       });
//     }

//     const grokResult = await grokResponse.json();
//     const productDescription = grokResult?.choices?.[0]?.message?.content?.trim();

//     if (!productDescription) {
//       console.warn("⚠️ No description returned by Grok.");
//       return res.status(204).json({
//         message: "No description generated.",
//         rawResponse: grokResult
//       });
//     }

//     console.log("✅ Grok Response received");
//     console.log("📄 Description length:", productDescription.length);

//     // 4️⃣ Generate 3D model with Meshy API
//     console.log("🎨 Starting 3D model generation...");
//     const model3D = await generate3DModelWithMeshy(
//       productDescription, 
//       artStyle || "realistic"
//     );

//     // 5️⃣ Return combined response
//     res.json({
//       success: true,
//       category: category.name,
//       region,
//       productName: productName || category.name,
//       insights: productDescription,
//       model3D,
//       metadata: {
//         grokModel: grokResult.model,
//         usage: grokResult.usage,
//         timestamp: new Date().toISOString(),
//         has3DModel: model3D?.success === true,
//         meshyTaskId: model3D?.taskId,
//         generationStatus: model3D?.status
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error analyzing category:", error);
//     res.status(500).json({
//       message: "Analysis failed",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };

// /**
//  * Get 3D model status from database
//  */
// export const get3DModelStatus = async (req, res) => {
//   try {
//     const { taskId } = req.params;
    
//     console.log("🔍 Checking task status from database:", taskId);

//     const [task] = await db
//       .select()
//       .from(meshyTasks)
//       .where(eq(meshyTasks.taskId, taskId));

//     if (!task) {
//       return res.status(404).json({ 
//         error: "Task not found",
//         taskId 
//       });
//     }

//     console.log("📊 Task status:", task.status, "Progress:", task.progress);

//     res.json({
//       taskId: task.taskId,
//       status: task.status,
//       progress: task.progress || 0,
//       modelUrls: task.modelUrls || null,
//       thumbnailUrl: task.thumbnailUrl || null,
//       videoUrl: task.videoUrl || null,
//       artStyle: task.artStyle,
//       prompt: task.prompt,
//       taskError: task.taskError,
//       createdAt: task.createdAt,
//       finishedAt: task.finishedAt
//     });

//   } catch (error) {
//     console.error("❌ Error fetching task status:", error);
//     res.status(500).json({
//       error: "Failed to fetch task status",
//       message: error.message
//     });
//   }
// };

// /**
//  * Meshy webhook handler - receives updates when model is ready
//  */
// export const meshyWebhook = async (req, res) => {
//   try {
//     const webhookData = req.body;
//     console.log("✅ Meshy Webhook Received for task:", webhookData.id);
//     console.log("📊 Status:", webhookData.status, "Progress:", webhookData.progress);

//     // Update database with webhook data
//     const updateData = {
//       status: webhookData.status,
//       progress: webhookData.progress || 0
//     };

//     // If succeeded, add model URLs
//     if (webhookData.status === "SUCCEEDED") {
//       updateData.modelUrls = webhookData.model_urls;
//       updateData.thumbnailUrl = webhookData.thumbnail_url;
//       updateData.videoUrl = webhookData.video_url;
//       updateData.finishedAt = new Date();
//       console.log("✅ Model URLs received:", Object.keys(webhookData.model_urls || {}));
//     }

//     // If failed, add error
//     if (webhookData.status === "FAILED") {
//       updateData.taskError = webhookData.task_error || "Generation failed";
//       updateData.finishedAt = new Date();
//       console.error("❌ Task failed:", updateData.taskError);
//     }

//     // Update database
//     await db
//       .update(meshyTasks)
//       .set(updateData)
//       .where(eq(meshyTasks.taskId, webhookData.id));

//     console.log("✅ Database updated successfully for task:", webhookData.id);
    
//     res.status(200).json({ received: true });

//   } catch (error) {
//     console.error("❌ Webhook processing error:", error);
//     res.status(500).json({ 
//       error: "Webhook processing failed",
//       message: error.message 
//     });
//   }
// };
