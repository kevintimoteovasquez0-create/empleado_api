ALTER TABLE "usuario" ALTER COLUMN "tipo_documento" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "usuario" ADD COLUMN "two_factor_secret" varchar(255);--> statement-breakpoint
ALTER TABLE "usuario" ADD COLUMN "recovery_codes" text;