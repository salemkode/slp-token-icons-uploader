import express from "express";
import api, { init as initApi } from "./server/api";
import "dotenv/config";

// init server and port
const app = express();
const port = Number(process.env.PORT) || 4000;

// init api
initApi().then(() => {
  app.use("/api", api);
  console.log("API is ready");
  // Front end
  app.use("/static", express.static("src/static"));
  app.use(express.static("src/view"));

  // Start Server
  app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
  });
});
