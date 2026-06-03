import express from "express";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use("/admin/metrics", middlewareLogMetrics);
app.use("/admin/reset", middlewareResetMetrics);
app.use(middlewareLogResponses);
app.get("/api/healthz", (req, res) => {
    res.set("Content-Type: text/plain; charset=utf-8").send('OK');
});
app.listen(PORT, () => {
    console.log(`Server is running at https://localhost:${PORT}`);
});
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
    config.fileserverHits++;
    next();
}
export async function middlewareLogMetrics(req, res) {
    res.set("Content-Type: text/plain; charset=utf-8").send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.fileserverHits} times!</p>
            </body>
        </html>
    `);
}
export async function middlewareResetMetrics(req, res, next) {
    config.fileserverHits = 0;
    res.set("Content-Type: text/plain; charset=utf-8").send("Metrics reset!");
}
