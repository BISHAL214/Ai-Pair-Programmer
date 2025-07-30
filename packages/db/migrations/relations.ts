import { relations } from "drizzle-orm/relations";
import { usersInAuth, users, projects, files, aiOverviews, explanations, chatMessages, commits } from "./schema";

export const usersRelations = relations(users, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [users.id],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users: many(users),
	projects: many(projects),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [projects.userId],
		references: [usersInAuth.id]
	}),
	files: many(files),
	aiOverviews: many(aiOverviews),
	explanations: many(explanations),
	chatMessages: many(chatMessages),
	commits: many(commits),
}));

export const filesRelations = relations(files, ({one, many}) => ({
	project: one(projects, {
		fields: [files.projectId],
		references: [projects.id]
	}),
	aiOverviews: many(aiOverviews),
	explanations: many(explanations),
}));

export const aiOverviewsRelations = relations(aiOverviews, ({one}) => ({
	file: one(files, {
		fields: [aiOverviews.fileId],
		references: [files.id]
	}),
	project: one(projects, {
		fields: [aiOverviews.projectId],
		references: [projects.id]
	}),
}));

export const explanationsRelations = relations(explanations, ({one}) => ({
	file: one(files, {
		fields: [explanations.fileId],
		references: [files.id]
	}),
	project: one(projects, {
		fields: [explanations.projectId],
		references: [projects.id]
	}),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	project: one(projects, {
		fields: [chatMessages.projectId],
		references: [projects.id]
	}),
}));

export const commitsRelations = relations(commits, ({one}) => ({
	project: one(projects, {
		fields: [commits.projectId],
		references: [projects.id]
	}),
}));