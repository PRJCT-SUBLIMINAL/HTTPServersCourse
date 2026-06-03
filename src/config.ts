process.loadEnvFile();

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) throw new Error("Can't find DB URL?!");
    return value;
}

type APIConfig = {
    fileServerHits: number;
    profaneWords: Array<string>;
    dbURL: string;
};

export const config: APIConfig = {
    fileServerHits: 0,
    profaneWords: ["kerfuffle", "sharbert", "fornax"],
    dbURL: envOrThrow("DB_URL")
};