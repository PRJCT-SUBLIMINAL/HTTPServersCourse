import {ErrorRequestHandler, Request, Response, NextFunction} from "express";
import {BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError} from "./classes.js";
import {config} from "./config.js";

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
    config.fileServerHits++;
    next();
}

export async function middlewareLogMetrics(req: Request, res: Response) {
    res.set("Content-Type: text/plain; charset=utf-8").send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.fileServerHits} times!</p>
            </body>
        </html>
    `);
}

export async function middlewareResetMetrics(req: Request, res: Response, next: NextFunction) {
    config.fileServerHits = 0;
    
    res.set("Content-Type: text/plain; charset=utf-8").send("Metrics reset!");
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