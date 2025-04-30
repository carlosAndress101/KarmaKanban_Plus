//import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  });
  

//   /** RELACIÓN USERS ↔ WORKSPACES */
//   export const workspaceMembers = pgTable('workspace_members', {
//     id: uuid('id').defaultRandom().primaryKey(),
//     workspaceId: uuid('workspace_id')
//       .notNull()
//       .references(() => workspaces.id, { onDelete: 'cascade' }),
//     userId: uuid('user_id')
//       .notNull()
//       .references(() => users.id, { onDelete: 'cascade' }),
//     role: text('role', )
//       .notNull()
//       .default('member'),  // roles: 'admin' | 'member' | 'guest'
//     invitedAt: timestamp('invited_at').defaultNow().notNull(),
//     accepted: boolean('accepted').default(false).notNull(),
//   });



