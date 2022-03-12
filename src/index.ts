import express from "express";
import simpleGit from "simple-git";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";

// routes
import api from "./server/routes/api.routes";

// model
import addDebug from "./server/model/logging.model";
import { setRemoteUrls, cloneRepo } from "./server/model/git.model";
import env from "./server/model/env.model";
import { setSimpleGit } from "./server/controllers/upload.controllers";

// init server
let app = addDebug(express());
const server = http.createServer(app);
const io = new Server(server);

// Set Port
const port = Number(env.PORT);

// init server
async function init() {
  app.debug.action("start init project");

  // Clone project of token icon
  if (!fs.existsSync("cache/repo")) {
    let git = simpleGit(); // for clone
    app.debug.action(`start clone ${env.REPO_NAME} project`);

    // start clone
    await cloneRepo(git);

    // alert of end
    app.debug.action(`end clone ${env.REPO_NAME} project`);
  } else {
    app.debug.action(`${env.REPO_NAME} project was cloned`);
  }

  // Init git of icon repo
  const git = simpleGit("cache/repo");

  // Set git of repo in uploader controller
  setSimpleGit(git);

  // Check of remote urls
  await setRemoteUrls(git);
  app.debug.action("set remote urls");

  // Start api
  app.debug.action("api is ready");
  app.use("/api", api);

  // Front end
  app.debug.action("Front end is ready");
  app.use("/static", express.static("src/static"));
  app.use(express.static("src/view"));

  // Start Server
  server.listen(port, () => {
    app.debug.status(`server start on http://localhost:${port}`);
  });
}

init();

export { app, io };

io.on("connect", (socket) => {
  let processId = socket.handshake.query.processId;

  //
  if (socket.handshake.query.processId) {
    socket.join(processId);
  }
});
