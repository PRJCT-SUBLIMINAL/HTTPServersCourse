import {asc, eq} from "drizzle-orm";
import {db} from "../index.js";
import {users, chirps, refreshTokens} from "../schema.js";

export async function storeRefreshToken(refreshToken: string, userId: string, expiryTime: number) {
    const expiresAt = new Date(Date.now() + expiryTime * 1000);
    await db.insert(refreshTokens).values({token: refreshToken, userId: userId, expiresAt: expiresAt});
}