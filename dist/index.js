import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
// My Imports //
import { hashPassword, getBearerToken, validateJWT } from "./auth.js";
import { createChirp, getAllChirps } from "./db/queries/chirps.js";
import { createUser } from "./db/queries/users.js";
import { middlewareMetricsInc, middlewareLogMetrics, middlewareResetMetrics, middlewareLogResponses, middlewareErrorHandler, middlewareGetChirp, middlewareGetUser, middlewareRefreshUser, middlewareRevokeUser } from "./middleware.js";
import { BadRequestError } from "./classes.js";
import { config } from "./config.js";
// Init //
const migrationClient = postgres(config.db.url, { max: 1 });
const PORT = 8080;
const app = express();
app.use(express.json());
async function main() {
    // Migrate Schema //    
    await migrate(drizzle(migrationClient), config.db.migrationConfig);
    // Start server //
    app.listen(PORT, () => {
        console.log(`Server is running at https://localhost:${PORT}`);
    });
}
;
// Load App //
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use("/admin/metrics", middlewareLogMetrics);
// Endpoints //
app.post("/admin/reset", middlewareResetMetrics);
app.use(middlewareLogResponses);
app.get("/api/healthz", (req, res) => {
    res.set("Content-Type: text/plain; charset=utf-8").send('OK');
});
// Chirps //
async function validateChirp(req, res) {
    const body = req.body.body;
    if (!body) {
        res.status(400).json({ error: "Something went wrong" });
        return;
    }
    if (body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }
    else {
        let words = body.split(" ");
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (config.api.profaneWords.includes(word.toLowerCase())) {
                words[i] = "****";
            }
            ;
        }
        ;
        const cleanedBody = words.join(" ");
        return cleanedBody;
    }
    ;
}
;
app.post("/api/chirps", async (req, res) => {
    const body = await validateChirp(req, res);
    if (body === undefined) {
        throw new BadRequestError("Body is undefined");
    }
    ;
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);
    const chirp = await createChirp({ body, userId });
    res.status(201).json(chirp);
});
app.get("/api/chirps", async (req, res) => {
    const chirps = await getAllChirps();
    if (!chirps) {
        res.status(400).json({ error: "Something went wrong" });
        return;
    }
    ;
    res.status(200).json(chirps);
});
app.get("/api/chirps/:chirpId", async (req, res, next) => {
    Promise.resolve(middlewareGetChirp(req, res)).catch(next);
});
// Users
app.post("/api/users", async (req, res) => {
    const body = req.body;
    if (!body) {
        res.status(400).json({ error: "Something went wrong" });
        return;
    }
    ;
    if (!body.password) {
        throw new BadRequestError("No password provided");
    }
    ;
    if (!body.email.includes("@")) {
        throw new BadRequestError("Email format needs an @ symbol.");
    }
    ;
    body.password = await hashPassword(body.password);
    const user = await createUser({ "email": body.email, "hashed_password": body.password });
    if (!user)
        throw new BadRequestError("Can't create user");
    const { hashed_password, ...userResponse } = user; // This is how to strip a field from an object.
    res.status(201).json(userResponse); // Send the stripped object back to the client
});
app.post(("/api/login"), middlewareGetUser);
app.post("/api/refresh", middlewareRefreshUser);
app.post("/api/revoke", middlewareRevokeUser);
app.use(middlewareErrorHandler);
main();
