import express from "express";
import {Request, Response} from "express";
import {middlewareMetricsInc, middlewareLogMetrics, middlewareResetMetrics, middlewareLogResponses, middlewareErrorHandler} from "./middleware.js";
import {BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError} from "./classes.js";
import {config} from "./config.js";

const app = express();
app.use(express.json());
const PORT = 8080;


// Load app
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use("/admin/metrics", middlewareLogMetrics);

// Endpoints //

app.post("/admin/reset", middlewareResetMetrics);

app.use(middlewareLogResponses);

app.get("/api/healthz", (req: Request, res: Response) => {
    res.set("Content-Type: text/plain; charset=utf-8").send('OK');
});

app.post("/api/validate_chirp", async (req: Request, res: Response)=>{
    const body = req.body.body;
    if (!body) {
        res.status(400).json({ error: "Something went wrong" });
        return;
    }

    if (body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    } else {
        let words = body.split(" ");
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (config.profaneWords.includes(word.toLowerCase())) {
                words[i] = "****";
            };
        };
        const cleanedBody = words.join(" ");
        res.status(200).json({ cleanedBody: cleanedBody });
    };
});

app.use(middlewareErrorHandler);

// Start server //

app.listen(PORT, () => {
    console.log(`Server is running at https://localhost:${PORT}`);
});