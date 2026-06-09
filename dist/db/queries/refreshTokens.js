import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens } from "../schema.js";
import { UnauthorizedError } from "../../classes.js";
export async function storeRefreshToken(refreshToken, userId, expiryTime) {
    const expiresAt = new Date(Date.now() + expiryTime * 1000);
    await db.insert(refreshTokens).values({ token: refreshToken, userId: userId, expiresAt: expiresAt });
}
export async function findRefreshToken(refreshToken) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    return result;
}
export async function getUserFromRefreshToken(refreshToken) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    if (!result)
        throw new UnauthorizedError("User not found.");
    return result.userId;
}
export async function revokeRefreshToken(refreshToken) {
    const [result] = await db.update(refreshTokens).set({ revokedAt: new Date(), updatedAt: new Date() }).where(eq(refreshTokens.token, refreshToken)).returning();
    return result;
}
