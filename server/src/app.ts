import express, { Application } from "express";
import cors from "cors";
import { corsOptions } from "./config";
import routes from "./routes";

import morgan from "morgan";
import { stream } from "./utils/logger";

const app: Application = express();

// Enable simplified HTTP logging (Method and URL only)
app.use(morgan(":method :url", { stream }));

// Enable CORS
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Use routes
app.use("/api", routes);

export default app;
