import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/** WORKSPACES TABLE */
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  inviteCode: text("invite_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userRoles = ["member", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const members = pgTable("members", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: userRoles }).notNull(),
  // Gamification fields
  gamificationRole: text("gamification_role", {
    enum: ["Developer", "Designer", "Project Manager", "Team Lead"],
  }),
  points: integer("points").default(0),
  selectedIcons: text("selected_icons"), // JSON array of selected icon IDs
  aboutMe: text("about_me"),
  earnedBadges: text("earned_badges"), // JSON array of earned badge IDs
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Track when a member earns a badge
export const memberBadges = pgTable("member_badges", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  projectManagerId: uuid("project_manager_id").references(() => members.id, {
    onDelete: "set null",
  }), // Project Manager assignment
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  assigneeId: uuid("assignee_id").references(() => members.id, {
    onDelete: "set null",
  }),
  description: text("description"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  status: text("status", {
  enum: ["NEW", "TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
  }).notNull(),
  difficulty: text("difficulty", {
    enum: ["Easy", "Medium", "Hard"],
  }).notNull(), // <-- NUEVO CAMPO
  archived: boolean("archived").default(false).notNull(), // Archive field
  position: integer("position").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Store Items table
export const storeItems = pgTable("store_items", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  category: text("category", {
    enum: ["Physical", "Digital", "Experience", "Perk"],
  }).notNull(),
  isActive: boolean("is_active").default(true),
  stock: integer("stock"), // null means unlimited
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Redemption Requests table
export const redemptionRequests = pgTable("redemption_requests", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  requesterId: uuid("requester_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  storeItemId: uuid("store_item_id")
    .notNull()
    .references(() => storeItems.id, { onDelete: "cascade" }),
  pointsSpent: integer("points_spent").notNull(),
  status: text("status", {
    enum: ["pending", "approved", "rejected", "fulfilled"],
  })
    .default("pending")
    .notNull(),
  notes: text("notes"), // User's redemption notes
  adminNotes: text("admin_notes"), // Admin's approval/rejection notes
  reviewedBy: uuid("reviewed_by").references(() => members.id, {
    onDelete: "set null",
  }), // Admin who reviewed
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
