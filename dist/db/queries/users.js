import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { users } from "../schema.js";
export async function createUser(user) {
    const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
    return result;
}
;
export async function deleteAllUsers() {
    await db.delete(users);
}
;
export async function getUser(email) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}
export async function updateUser(userId, email, password) {
    const [result] = await db.update(users).set({ email: email, hashed_password: password }).where(eq(users.id, userId)).returning();
    return result;
}
