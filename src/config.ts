import { EnvironmentError } from "./classes.js";
import {MigrationConfig} from "drizzle-orm/migrator";

process.loadEnvFile();

export function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) throw new EnvironmentError(`Can't find ${key} in .env | Include .env at the root of your folder and initialize your key: ${key}=""`);
    return value;
}

type APIConfig = {
    fileServerHits: number;
    profaneWords: Array<string>;
    platform: string;
    jwtSecret: string;
};

// Note: Hand-written type definitions (DBConfig) are omitted.
export const config = {
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: {migrationsFolder: "./src/db/migrations"} satisfies MigrationConfig // Ensures this matches Drizzle's expected structure perfectly!
    },
    api: {
        fileServerHits: 0,
        profaneWords: ["kerfuffle", "sharbert", "fornax"],
        platform: envOrThrow("PLATFORM"),
        jwtSecret: envOrThrow("JWT_SECRET")
    } satisfies APIConfig // Ensures the API config is matching structure
} as const;
// TypeScript automatically infers the narrowest, read-only types when using a `as const` assertion on the object literal.
// This also makes the object deeply read-only (immutable).