import { EnvironmentError } from "./classes.js";
process.loadEnvFile();
export function envOrThrow(key) {
    const value = process.env[key];
    if (!value)
        throw new EnvironmentError(`Can't find ${key} in .env | Include .env at the root of your folder and initialize your key: ${key}=""`);
    return value;
}
// Note: Hand-written type definitions (DBConfig) are omitted.
export const config = {
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: { migrationsFolder: "./src/db/migrations" } // Ensures this matches Drizzle's expected structure perfectly!
    },
    api: {
        fileServerHits: 0,
        profaneWords: ["kerfuffle", "sharbert", "fornax"],
        platform: envOrThrow("PLATFORM")
    } // Ensures the API config is matching structure
};
// TypeScript automatically infers the narrowest, read-only types when using a `as const` assertion on the object literal.
// This also makes the object deeply read-only (immutable).
