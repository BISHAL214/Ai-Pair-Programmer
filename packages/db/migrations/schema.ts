import { pgTable, foreignKey, pgPolicy, uuid, text, timestamp, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	username: text(),
	avatarUrl: text("avatar_url"),
	fullName: text("full_name"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_fkey"
		}),
	pgPolicy("Can view own user data", { as: "permissive", for: "select", to: ["public"], using: sql`(auth.uid() = id)` }),
	pgPolicy("Can update own user data", { as: "permissive", for: "update", to: ["public"] }),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	sourceType: text("source_type").notNull(),
	githubUrl: text("github_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "projects_user_id_fkey"
		}),
	pgPolicy("Users can manage their own projects", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.uid() = user_id)` }),
	check("projects_source_type_check", sql`source_type = ANY (ARRAY['zip'::text, 'github'::text])`),
]);

export const files = pgTable("files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	path: text().notNull(),
	content: text(),
	language: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "files_project_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can access files of their projects", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = files.project_id) AND (projects.user_id = auth.uid()))))` }),
]);

export const aiOverviews = pgTable("ai_overviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fileId: uuid("file_id"),
	projectId: uuid("project_id"),
	suggestion: text(),
	reason: text(),
	updatedCode: text("updated_code"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [files.id],
			name: "ai_overviews_file_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "ai_overviews_project_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can read/write AI overview for their projects", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = ai_overviews.project_id) AND (projects.user_id = auth.uid()))))` }),
]);

export const explanations = pgTable("explanations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fileId: uuid("file_id"),
	projectId: uuid("project_id"),
	section: text().notNull(),
	explanation: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [files.id],
			name: "explanations_file_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "explanations_project_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can read/write Explanations for their projects", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = explanations.project_id) AND (projects.user_id = auth.uid()))))` }),
]);

export const chatMessages = pgTable("chat_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	sender: text(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "chat_messages_project_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can chat only in their own projects", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = chat_messages.project_id) AND (projects.user_id = auth.uid()))))` }),
	check("chat_messages_sender_check", sql`sender = ANY (ARRAY['user'::text, 'ai'::text])`),
]);

export const commits = pgTable("commits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	message: text(),
	diff: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "commits_project_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can view their commits", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = commits.project_id) AND (projects.user_id = auth.uid()))))` }),
]);
