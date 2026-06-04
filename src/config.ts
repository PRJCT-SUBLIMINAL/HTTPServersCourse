import { EnvironmentError } from "./classes.js";
import {MigrationConfig} from "drizzle-orm/migrator";

process.loadEnvFile();

export function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) throw new EnvironmentError(`Can't find ${key} in .env | Include .env at the root of your folder and initialize your key: ${key}=""`);
    return value;
}

// type APIConfig = {
//     fileServerHits: number;
//     profaneWords: Array<string>;
//     platform: string;
// };

// type DBConfig = {
//     url: string;
//     migrationConfig: MigrationConfig;
// };

// as seen here:
export const config = {
    db: {url: envOrThrow("DB_URL"), migrationConfig: {migrationsFolder: "./src/db/migrations"}},
    api: {fileServerHits: 0, profaneWords: ["kerfuffle", "sharbert", "fornax"], platform: envOrThrow("PLATFORM")}
} as const; // With this the object can't be mutated also

// Note: Hand-written type definitions (AbsoluteConfig, DBConfig, etc.) are omitted.

// TypeScript automatically infers the narrowest, read-only types when using a `as const` assertion on the object literal.
// This also makes the object deeply read-only (immutable).