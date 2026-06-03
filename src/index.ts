import express from "express";
import {Request, Response, NextFunction} from "express";
import {config} from "./config.js";

const app = express();
const PORT = 8080;

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use("/metrics", middlewareLogMetrics);

app.use("/reset", middlewareResetMetrics);

app.use(middlewareLogResponses);

app.get("/healthz", (req: Request, res: Response) => {
    res.set("Content-Type", "text/plain; charset=utf-8").send('OK');
})

app.listen(PORT, () => {
    console.log(`Server is running at https://localhost:${PORT}`);
});


// Middleware //

export async function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", ()=>{
        const statusCode = res.statusCode;
        if (statusCode < 200 || statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        };
    })
    next();
}

export async function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++;
    next();
}

export async function middlewareLogMetrics(req: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8").send(`Hits: ${config.fileserverHits}`);
}

export async function middlewareResetMetrics(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits = 0;
    
    res.set("Content-Type", "text/plain; charset=utf-8").send("Metrics reset!");
}