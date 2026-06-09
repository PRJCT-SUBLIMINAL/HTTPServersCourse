import {asc, eq} from "drizzle-orm";
import {db} from "../index.js";
import {users, chirps, refreshTokens} from "../schema.js";
import { UnauthorizedError } from "../../classes.js";

export async function storeRefreshToken(refreshToken: string, userId: string, expiryTime: number) {
    const expiresAt = new Date(Date.now() + expiryTime * 1000);
    await db.insert(refreshTokens).values({token: refreshToken, userId: userId, expiresAt: expiresAt});
}

export async function findRefreshToken(refreshToken: string) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    return result;
}

export async function getUserFromRefreshToken(refreshToken: string) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    if (!result) throw new UnauthorizedError("User not found.")
    return result.userId;
}

export async function revokeRefreshToken(refreshToken: string) {
    const [result] = await db.update(refreshTokens).set({revokedAt: new Date(), updatedAt: new Date()}).where(eq(refreshTokens.token, refreshToken)).returning();
    return result;
}