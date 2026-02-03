ALTER TABLE "commentary" DROP CONSTRAINT "commentary_match_id_matches_id_fk";
--> statement-breakpoint
ALTER TABLE "commentary" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "commentary" ALTER COLUMN "sequence" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "commentary" ALTER COLUMN "period" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "commentary" ALTER COLUMN "event_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "commentary" ALTER COLUMN "event_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "commentary" ALTER COLUMN "actor" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "commentary" ALTER COLUMN "team" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "commentary" ALTER COLUMN "tags" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "sport" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "home_team" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "away_team" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "commentary" ADD CONSTRAINT "commentary_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;