import * as path from "path";
import compression from "compression";
import cors from "cors";
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import ApiError from "./middleware/error-handler/api-error.js";
import errorHandler from "./middleware/error-handler/index.js";

export default async function app() {
  const app = express();

  // Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app
  app.use(compression());

  // Parse json request body
  app.use(json());

  // Parse urlencoded request body
  app.use(urlencoded({ extended: true }));

  // Set security HTTP headers
  app.use(helmet());

  // Cors
  app.use(cors());

  /**
   * API documentation
   * ===========================================================
   * This would serve api documentation website
   *
   * const __dirname = path.dirname((import.meta.url));
   * res.sendFile(path.join(__dirname, "../docs/index.html"));
   *
   * Code above isn't work on jest (SyntaxError: Cannot use 'import.meta' outside a module)
   * So we use process.cwd() instead
   */
  app.use("/assets", express.static("src/assets"));
  app.use("/assets/api-docs", express.static("docs"));
  app.get("/", (req, res) => {
    res.header("Content-Security-Policy", "script-src blob:");
    res.header("Content-Security-Policy", "worker-src blob:");
    res.sendFile(path.join(process.cwd(), "/docs/template.html"));
  });

  // Send back a 404 error for any unknown api request
  app.use((req, res, next) => {
    next(ApiError.notFound());
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
