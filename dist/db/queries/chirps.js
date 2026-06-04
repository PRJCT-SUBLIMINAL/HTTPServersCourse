import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";
// CREATE CHIRP //
export async function createChirp(chirp) {
    const [result] = await db.insert(chirps).values(chirp).returning();
    return result;
}
// GET CHIRP //
export async function getChirp(chirpId) {
    const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
    return result;
}
// GET ALL CHIRPS //
export async function getAllChirps() {
    const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
    return result;
}
