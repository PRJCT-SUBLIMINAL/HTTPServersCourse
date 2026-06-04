import { EnvironmentError } from "./classes.js";
process.loadEnvFile();
function envOrThrow(key) {
    const value = process.env[key];
    if (!value)
        throw new EnvironmentError("Can't find DB URL?!");
    return value;
}
export const config = {
    db: { url: envOrThrow("DB_URL"), migrationConfig: { migrationsFolder: "./src/db/migrations" } },
    api: { fileServerHits: 0, profaneWords: ["kerfuffle", "sharbert", "fornax"], platform: envOrThrow("PLATFORM") }
};
