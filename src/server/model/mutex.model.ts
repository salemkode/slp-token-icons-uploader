import { SimpleGit } from "simple-git";
import { createBranch, createBranchName, pushBranch } from "./git.model";
import { createPullRequest } from "./github.model";
import { resizeImage, resizeOrigin } from "./photo.model";
import ranidb from "@salemkode/ranidb";
import * as socket from "./socket.model";

let processes = new ranidb("db/processes.json");
let archive = new ranidb("db/archive.json");
let running: boolean = false;

//
interface imageProcess {
  name: string;
  txid: string;
  message: string;
  file: Express.Multer.File;
  isDone?: boolean;
  _id?: string;
}

//
export function addProcess(git: SimpleGit, image: imageProcess) {
  image.isDone = false;
  let { _id } = processes.push(image) as imageProcess;

  //
  if (!running) {
    // Alert user of process start
    socket.action("process start", _id);
    nextProcess(git);
  } else {
    // Alert user of process not start
    socket.action("padding process", _id);
  }

  //
  return _id;
}

//
async function runProcess(git: SimpleGit) {
  // Select current image and remove it from list
  let image = processes.getAll()[0]! as imageProcess;

  // Delete from processes
  processes.delete(0);

  // Reset Git and create new branch
  let branchName = await createBranchName(git, image.name);
  await createBranch(git, branchName);

  // Resize image
  await resizeImage(image.file.path, [32, 64, 128], image.txid);
  await resizeOrigin(image.file.path, image.txid);

  //
  socket.action("compleate resize", image._id);

  // Push Change to repo
  await pushBranch(git, branchName);
  socket.action("push icon", image._id);

  // Push Pull Request
  let url = await createPullRequest(
    image.name,
    image.txid,
    branchName,
    image.message
  );

  //
  socket.complete("push icon complete", image._id, url);

  //
  archive.push({
    ...image,
    url,
  });

  // Run next process
  running = false;
  nextProcess(git);
}

//
async function nextProcess(git: SimpleGit) {
  //
  if (running) {
    return;
  }

  //
  if (processes.getAll().length) {
    running = true;

    //
    runProcess(git);
  }
}
