import express from "express";
import api, { init as initApi } from "./server/api";
import "dotenv/config";

// init server and port
const app = express();
const port = Number(process.env.PORT) || 4000;

//
console.log("project run");

// init api
initApi().then(() => {
  console.log("API is ready");
  app.use("/api", api);

  // Front end
  app.use("/static", express.static("src/static"));
  app.use(express.static("src/view"));

  // Start Server
  app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
  });
});
