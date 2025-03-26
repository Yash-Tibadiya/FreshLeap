ALTER TABLE "users" ADD COLUMN "verifyCode" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verifyCodeExpiry" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isVerified" boolean DEFAULT false;