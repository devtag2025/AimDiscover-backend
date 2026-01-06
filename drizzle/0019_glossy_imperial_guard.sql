ALTER TABLE "master_prompts" DROP CONSTRAINT "master_prompts_key_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "master_prompts_key_idx" ON "master_prompts" USING btree ("key");