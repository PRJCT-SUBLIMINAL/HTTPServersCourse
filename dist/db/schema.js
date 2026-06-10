import { pgTable, timestamp, varchar, uuid, text, boolean } from "drizzle-orm/pg-core";
// Tables
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).notNull().unique(),
    hashed_password: varchar("password").notNull().default("unset"),
    isChirpyRed: boolean("is_chirpy_red").default(false)
});
export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    body: text("body").notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});
export const refreshTokens = pgTable("refresh_tokens", {
    token: text("token").primaryKey().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at")
});
