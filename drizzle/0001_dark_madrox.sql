CREATE TABLE "todo_category" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo_item" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text NOT NULL,
	"content" text NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "todo_category" ADD CONSTRAINT "todo_category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_item" ADD CONSTRAINT "todo_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_item" ADD CONSTRAINT "todo_item_category_id_todo_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."todo_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "todoCategory_userId_idx" ON "todo_category" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "todoItem_userId_idx" ON "todo_item" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "todoItem_categoryId_idx" ON "todo_item" USING btree ("category_id");