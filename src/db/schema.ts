import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

// Tables

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
    email: varchar("email", {length: 256}).notNull().unique()
});

// Types //

export type NewUser = typeof users.$inferInsert;