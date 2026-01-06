
import db from "../db/connect.js";
import { masterPrompts } from "../schema/prompt.js";

export class PromptService {
 async savePrompt(data) {
  console.log("Saving prompt:", data);

  const { key, content } = data;

  const prompt = await db
    .insert(masterPrompts)
    .values({ key, content })
    .onConflictDoUpdate({
      target: masterPrompts.key,
      set: {
        content,
        updatedAt: new Date(),
      },
    })
    .returning();

  return prompt[0];
}


  async getPrompt(key) {
    const prompt = await db
      .select()
      .from(masterPrompts)
      .where(masterPrompts.key.eq(key))
      .limit(1);

    if (!prompt.length) {
      throw new Error(`Prompt not found for key: ${key}`);
    }

    return prompt[0];
  }
}

export const promptService = new PromptService();
