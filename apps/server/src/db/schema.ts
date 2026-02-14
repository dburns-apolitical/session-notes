import { pgTable, text, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";

export const project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectMember = pgTable("project_member", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const song = pgTable("song", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const step = pgTable("step", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cell = pgTable("cell", {
  id: uuid("id").defaultRandom().primaryKey(),
  songId: uuid("song_id").notNull().references(() => song.id, { onDelete: "cascade" }),
  stepId: uuid("step_id").notNull().references(() => step.id, { onDelete: "cascade" }),
  isComplete: boolean("is_complete").default(false).notNull(),
  completedBy: text("completed_by"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const note = pgTable("note", {
  id: uuid("id").defaultRandom().primaryKey(),
  cellId: uuid("cell_id").notNull().references(() => cell.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
