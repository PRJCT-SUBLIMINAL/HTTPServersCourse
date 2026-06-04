import { EnvironmentError } from "./classes.js";
import {MigrationConfig} from "drizzle-orm/migrator";

process.loadEnvFile();

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) throw new EnvironmentError("Can't find DB URL?!");
    return value;
}

type AbsoluteConfig = {
    db: DBConfig;
    api: APIConfig;
}

type APIConfig = {
    fileServerHits: number;
    profaneWords: Array<string>;
    platform: string;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
};

export const config: AbsoluteConfig = {
    db: {url: envOrThrow("DB_URL"), migrationConfig: {migrationsFolder: "./src/db/migrations"}},
    api: {fileServerHits: 0, profaneWords: ["kerfuffle", "sharbert", "fornax"], platform: envOrThrow("PLATFORM")}
};