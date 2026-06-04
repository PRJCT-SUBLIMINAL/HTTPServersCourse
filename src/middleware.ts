import {ErrorRequestHandler, Request, Response, NextFunction} from "express";
import {BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, EnvironmentError} from "./classes.js";
import {config} from "./config.js";
import { deleteAllUsers } from "./db/queries/users.js";
import { getChirp } from "./db/queries/chirps.js";

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

export const middlewareErrorHandler: ErrorRequestHandler = (err, req, res) => {
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