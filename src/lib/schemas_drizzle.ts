import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/** WORKSPACES TABLE */
export const workspaces = pgTable('workspaces', {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  inviteCode: text("invite_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const userRoles = ["member", "admin"] as const;
export type UserRole = typeof userRoles[number]; 

export const members = pgTable("members", {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role", { enum: userRoles }).notNull(),
  // Gamification fields
  gamificationRole: text("gamification_role", { enum: ["Developer", "Designer", "Project Manager", "Team Lead"] }),
  points: integer("points").default(0),
  selectedIcons: text("selected_icons"), // JSON array of selected icon IDs
  aboutMe: text("about_me"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const projects = pgTable("projects", {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const tasks = pgTable("tasks", {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  assigneeId: uuid('assignee_id').references(() => members.id, { onDelete: 'set null' }),
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  status: text("status", { enum: ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] }).notNull(),
  difficulty: text("difficulty", { enum: ["Facil", "Medio", "Dificil"] }).notNull(), // <-- NUEVO CAMPO
  position: integer("position").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});



