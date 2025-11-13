import { stripeService } from '../services/index.js';
import { ApiResponse } from '../utils/index.js';
import { env } from '../config/env.config.js';
import db from '../db/connect.js';
import { meshyTasks } from '../schema/meshy-tasks.js';
import { eq } from 'drizzle-orm';

import fetch from 'node-fetch';
import { put } from '@vercel/blob'; // or use AWS S3, Cloudinary, etc.

// ===== STRIPE WEBHOOKS =====
const MESHY_WEBHOOK_SECRET = env.MESHY_WEBHOOK_SECRET;
console.log("----- MESHY_WEBHOOK_SECRET" , !!MESHY_WEBHOOK_SECRET)
export const handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.body;

    if (!signature) {
      return res.status(400).json(
        new ApiResponse(400, null, "Missing Stripe signature")
      );
    }

    const result = await stripeService.processWebhook(rawBody, signature);
    
    res.status(200).json(
      new ApiResponse(200, result, "Webhook processed successfully")
    );

  } catch (error) {
    // Handle signature verification errors
    if (error.message.includes('signature')) {
      return res.status(400).json(
        new ApiResponse(400, null, "Webhook signature verification failed")
      );
    }
    res.status(200).json(
      new ApiResponse(200, { processed: false }, "Webhook received but processing failed")
    );
  }
};

import crypto from "crypto";




// export const handleMeshyWebhook = async (req, res) => {
//   try {
//     let payload;

//     // Handle both raw Buffer and parsed JSON
//     if (Buffer.isBuffer(req.body)) {
//       const rawBody = req.body.toString();
//       payload = JSON.parse(rawBody);
//     } else {
//       payload = req.body;
//     }

//     const signature = req.headers["x-meshy-signature"];
//     const secret = process.env.MESHY_WEBHOOK_SECRET;

//     // Signature verification (if secret provided)
//     if (secret && signature && Buffer.isBuffer(req.body)) {
//       const computedSignature = crypto
//         .createHmac("sha256", secret)
//         .update(req.body)
//         .digest("hex");

//       if (computedSignature !== signature) {
//         console.error("❌ Invalid webhook signature");
//         return res.status(400).json({ message: "Invalid signature" });
//       }
//     }

//     console.log("✅ Meshy Webhook Received:");
//     console.log("Status:", payload.status);
//     console.log("Task ID:", payload.id);
//     console.log("Progress:", payload.progress);

//     // Prepare data to save in DB
//     const updateData = {
//       status: payload.status || "PENDING",
//       progress: payload.progress || 0,
//       prompt: payload.prompt || "",
//       artStyle: payload.art_style || "",
//       modelUrls: payload.model_urls ? JSON.stringify(payload.model_urls) : null,
//       thumbnailUrl: payload.thumbnail_url || null,
//       videoUrl: payload.video_url || null,
//       finishedAt: payload.status === "SUCCEEDED" || payload.status === "FAILED" ? new Date() : null,
//       taskError: payload.task_error || null,
//     };

//     // Update existing task or insert if not found
//     const [updatedTask] = await db
//       .update(meshyTasks)
//       .set(updateData)
//       .where(eq(meshyTasks.taskId, payload.id))
//       .returning();

//     if (!updatedTask) {
//       console.log("⚠️ Task not found in DB, inserting a new one...");
//       const [newTask] = await db.insert(meshyTasks).values({
//         id: payload.id, // you can use createId() if you want a unique DB ID separate from Meshy taskId
//         taskId: payload.id,
//         ...updateData,
//         createdAt: new Date(),
//       }).returning();

//       console.log("💾 New task inserted:", newTask.taskId);
//     } else {
//       console.log("💾 Existing task updated:", updatedTask.taskId);
//     }

//     // Optional: log model URLs if succeeded
//     if (payload.status === "SUCCEEDED" && payload.model_urls) {
//       console.log("🧱 Model generation succeeded!");
//       console.log("GLB URL:", payload.model_urls.glb);
//       console.log("FBX URL:", payload.model_urls.fbx);
//       console.log("USDZ URL:", payload.model_urls.usdz);
//       console.log("OBJ URL:", payload.model_urls.obj);
//       console.log("Thumbnail URL:", payload.thumbnail_url);
//       console.log("Video URL:", payload.video_url);
//     }

//     res.status(200).json({ message: "Webhook processed successfully" });
//   } catch (error) {
//     console.error("❌ Error in webhook:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };



export const handleMeshyWebhook = async (req, res) => {
  try {
    let payload;

    // Handle both raw Buffer and parsed JSON
    if (Buffer.isBuffer(req.body)) {
      const rawBody = req.body.toString();
      payload = JSON.parse(rawBody);
    } else {
      payload = req.body;
    }

    const signature = req.headers["x-meshy-signature"];
    const secret = process.env.MESHY_WEBHOOK_SECRET;

    // Signature verification (if secret provided)
    if (secret && signature && Buffer.isBuffer(req.body)) {
      const computedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      if (computedSignature !== signature) {
        console.error("❌ Invalid webhook signature");
        return res.status(400).json({ message: "Invalid signature" });
      }
    }

    console.log("✅ Meshy Webhook Received:");
    console.log("Status:", payload.status);
    console.log("Task ID:", payload.id);
    console.log("Progress:", payload.progress);

    // 🔥 Download and store files when succeeded
    let permanentUrls = null;
    if (payload.status === "SUCCEEDED" && payload.model_urls) {
      console.log("🧱 Model generation succeeded! Downloading files...");
      
      try {
        permanentUrls = await downloadAndStoreFiles(payload);
        console.log("✅ Files stored permanently:", permanentUrls);
      } catch (downloadError) {
        console.error("❌ Error downloading files:", downloadError);
        // Continue anyway, we'll store temporary URLs as fallback
      }
    }

    // Prepare data to save in DB
    const updateData = {
      status: payload.status || "PENDING",
      progress: payload.progress || 0,
      prompt: payload.prompt || "",
      artStyle: payload.art_style || "",
      // Store permanent URLs if available, otherwise temporary ones
      modelUrls: permanentUrls 
        ? JSON.stringify(permanentUrls) 
        : (payload.model_urls ? JSON.stringify(payload.model_urls) : null),
      thumbnailUrl: permanentUrls?.thumbnail || payload.thumbnail_url || null,
      videoUrl: permanentUrls?.video || payload.video_url || null,
      finishedAt: payload.status === "SUCCEEDED" || payload.status === "FAILED" ? new Date() : null,
      taskError: payload.task_error || null,
    };

    // Update existing task or insert if not found
    const [updatedTask] = await db
      .update(meshyTasks)
      .set(updateData)
      .where(eq(meshyTasks.taskId, payload.id))
      .returning();

    if (!updatedTask) {
      console.log("⚠️ Task not found in DB, inserting a new one...");
      const [newTask] = await db.insert(meshyTasks).values({
        id: payload.id,
        taskId: payload.id,
        ...updateData,
        createdAt: new Date(),
      }).returning();

      console.log("💾 New task inserted:", newTask.taskId);
    } else {
      console.log("💾 Existing task updated:", updatedTask.taskId);
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("❌ Error in webhook:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔥 Helper function to download and store files permanently
async function downloadAndStoreFiles(payload) {
  const apiKey = process.env.MESHY_API_KEY;
  const files = {};

  // Download GLB file
  if (payload.model_urls?.glb) {
    try {
      const glbResponse = await fetch(payload.model_urls.glb, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (glbResponse.ok) {
        const glbBlob = await glbResponse.blob();
        const glbBuffer = Buffer.from(await glbBlob.arrayBuffer());
        
        // Upload to your storage (Vercel Blob example)
        const { url } = await put(`models/${payload.id}.glb`, glbBuffer, {
          access: 'public',
          contentType: 'model/gltf-binary',
        });
        
        files.glb = url;
        console.log("✅ GLB uploaded:", url);
      }
    } catch (err) {
      console.error("❌ Error downloading GLB:", err);
    }
  }

  // Download FBX file
  if (payload.model_urls?.fbx) {
    try {
      const fbxResponse = await fetch(payload.model_urls.fbx, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (fbxResponse.ok) {
        const fbxBlob = await fbxResponse.blob();
        const fbxBuffer = Buffer.from(await fbxBlob.arrayBuffer());
        
        const { url } = await put(`models/${payload.id}.fbx`, fbxBuffer, {
          access: 'public',
          contentType: 'application/octet-stream',
        });
        
        files.fbx = url;
        console.log("✅ FBX uploaded:", url);
      }
    } catch (err) {
      console.error("❌ Error downloading FBX:", err);
    }
  }

  // Download thumbnail
  if (payload.thumbnail_url) {
    try {
      const thumbResponse = await fetch(payload.thumbnail_url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (thumbResponse.ok) {
        const thumbBlob = await thumbResponse.blob();
        const thumbBuffer = Buffer.from(await thumbBlob.arrayBuffer());
        
        const { url } = await put(`thumbnails/${payload.id}.png`, thumbBuffer, {
          access: 'public',
          contentType: 'image/png',
        });
        
        files.thumbnail = url;
        console.log("✅ Thumbnail uploaded:", url);
      }
    } catch (err) {
      console.error("❌ Error downloading thumbnail:", err);
    }
  }

  // Download video (if exists)
  if (payload.video_url) {
    try {
      const videoResponse = await fetch(payload.video_url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (videoResponse.ok) {
        const videoBlob = await videoResponse.blob();
        const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
        
        const { url } = await put(`videos/${payload.id}.mp4`, videoBuffer, {
          access: 'public',
          contentType: 'video/mp4',
        });
        
        files.video = url;
        console.log("✅ Video uploaded:", url);
      }
    } catch (err) {
      console.error("❌ Error downloading video:", err);
    }
  }

  return files;
}