import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "./classes.js";
import { config } from "./config.js";
import { deleteAllUsers, getUser } from "./db/queries/users.js";
import { getChirp } from "./db/queries/chirps.js";
import { checkPasswordHash, makeJWT } from "./auth.js";
// Middleware //
export async function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode < 200 || statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
        ;
    });
    next();
}
export async function middlewareMetricsInc(req, res, next) {
    config.api.fileServerHits++;
    next();
}
export async function middlewareLogMetrics(req, res) {
    res.set("Content-Type: text/plain; charset=utf-8").send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
            </body>
        </html>
    `);
}
export async function middlewareResetMetrics(req, res, next) {
    if (config.api.platform !== "dev") {
        throw new ForbiddenError("You are not in a development environment!");
    }
    await deleteAllUsers();
    config.api.fileServerHits = 0;
    res.set("Content-Type: text/plain; charset=utf-8").send("Metrics reset!");
}
export async function middlewareGetChirp(req, res) {
    if (!req.params) {
        throw new BadRequestError("No chirp ID?");
    }
    ;
    const chirpId = req.params.chirpId;
    if (!chirpId)
        return;
    const chirp = await getChirp(chirpId);
    if (!chirp)
        throw new NotFoundError("Chirp not found!");
    res.status(200).json(chirp);
}
export async function middlewareGetUser(req, res) {
    try {
        const user = await getUser(req.body.email);
        const hashedPassword = user.hashed_password;
        const isValid = await checkPasswordHash(req.body.password, hashedPassword);
        if (!isValid)
            throw new BadRequestError("invalid password");
        const requestedExpiry = req.body.expiresInSeconds ?? 3600; // 1 hour
        const expiresIn = Math.min(requestedExpiry, 3600);
        const token = makeJWT(user.id, expiresIn, config.api.jwtSecret);
        const { hashed_password, ...userResponse } = user;
        res.status(200).json({ ...userResponse, token });
    }
    catch {
        throw new UnauthorizedError("incorrect email or password");
    }
}
export const middlewareErrorHandler = (err, req, res, next) => {
    console.log(err);
    const body = { error: err.message };
    if (err instanceof BadRequestError) {
        res.status(400).json(body);
    }
    else if (err instanceof UnauthorizedError) {
        res.status(401).json(body);
    }
    else if (err instanceof ForbiddenError) {
        res.status(403).json(body);
    }
    else if (err instanceof NotFoundError) {
        res.status(404).json(body);
    }
    else {
        res.status(500).json({ error: "Something went wrong on our end" });
    }
};
