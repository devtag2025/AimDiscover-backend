CREATE TABLE "meshy_tasks" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"task_id" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"progress" integer DEFAULT 0,
	"prompt" text,
	"art_style" varchar(50),
	"model_urls" jsonb,
	"thumbnail_url" text,
	"video_url" text,
	"created_at" timestamp DEFAULT now(),
	"finished_at" timestamp,
	CONSTRAINT "meshy_tasks_task_id_unique" UNIQUE("task_id")
);
