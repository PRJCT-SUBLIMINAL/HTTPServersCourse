ALTER TABLE "chirps" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chirps" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;