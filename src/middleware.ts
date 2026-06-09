import {ErrorRequestHandler, Request, Response, NextFunction} from "express";
import {BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, EnvironmentError} from "./classes.js";
import {config} from "./config.js";
import { deleteAllUsers, getUser } from "./db/queries/users.js";
import { getChirp } from "./db/queries/chirps.js";
import {storeRefreshToken, findRefreshToken, getUserFromRefreshToken, revokeRefreshToken} from "./db/queries/refreshTokens.js";
import { checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken } from "./auth.js";

// Middleware //

export async function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", ()=>{
        const statusCode = res.statusCode;
        if (statusCode < 200 || statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        };
    });
    next();
}

export async function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.api.fileServerHits++;
    next();
}

export async function middlewareLogMetrics(req: Request, res: Response) {
    res.set("Content-Type: text/plain; charset=utf-8").send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
            </body>
        </html>
    `);
}

export async function middlewareResetMetrics(req: Request, res: Response, next: NextFunction) {
    if (config.api.platform !== "dev") {
        throw new ForbiddenError("You are not in a development environment!");
    }

    await deleteAllUsers();

    config.api.fileServerHits = 0;
    
    res.set("Content-Type: text/plain; charset=utf-8").send("Metrics reset!");
}

export async function middlewareGetChirp(req: Request, res: Response) {
    if (!req.params) {
        throw new BadRequestError("No chirp ID?");
    };

    const chirpId = req.params.chirpId as string;
    if (!chirpId) return;

    const chirp = await getChirp(chirpId)

    if (!chirp) throw new NotFoundError("Chirp not found!");

    res.status(200).json(chirp);
}

export async function middlewareGetUser(req: Request, res: Response) {
    try {
        const user = await getUser(req.body.email);
        const hashedPassword = user.hashed_password
        const isValid = await checkPasswordHash(req.body.password, hashedPassword)
        if (!isValid) throw new BadRequestError("invalid password");

        const token = makeJWT(user.id, 3600, config.api.jwtSecret);
        const refreshToken = makeRefreshToken();
        await storeRefreshToken(refreshToken, user.id, 3600 * 24 * 60);

        const { hashed_password, ...userResponse } = user;
        res.status(200).json({...userResponse, token, refreshToken});
    } catch {
        throw new UnauthorizedError("incorrect email or password");
    }
}

export async function middlewareRefreshUser(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    const foundRefreshToken = await findRefreshToken(refreshToken);
    if (!foundRefreshToken || (foundRefreshToken.expiresAt < new Date()) || foundRefreshToken.revokedAt) {
        throw new UnauthorizedError("Can't find refresh token");
    }

    const userId = await getUserFromRefreshToken(refreshToken);
    if (!userId) {
        throw new UnauthorizedError("User not authorized.")
    }
    const token = makeJWT(userId, 3600, config.api.jwtSecret);

    res.status(200).json({token});
}

export async function middlewareRevokeUser(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    const foundRefreshToken = await findRefreshToken(refreshToken);
    
    if (!foundRefreshToken || (foundRefreshToken.expiresAt < new Date()) || foundRefreshToken.revokedAt) {
        throw new UnauthorizedError("Can't find refresh token");
    }

    const token = await revokeRefreshToken(refreshToken);
    if (!token) throw new UnauthorizedError("Unauthorized user.");

    res.status(204).send();
}

export const middlewareErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log(err);
    const body = { error: err.message }
    if (err instanceof BadRequestError) {
        res.status(400).json(body);
    } else if (err instanceof UnauthorizedError) {
        res.status(401).json(body);
    } else if (err instanceof ForbiddenError) {
        res.status(403).json(body);
    } else if (err instanceof NotFoundError) {
        res.status(404).json(body);
    } else {
        res.status(500).json({ error: "Something went wrong on our end" });
    }
}