/*
    Icon process
        1- select master branch 
        2- resize Photo 
        3- push to repo
        4- create pull request
*/
import sharp from "sharp";
import { resize } from "./lib";
import fs from "fs";
import "dotenv/config";

// init github api
import { Octokit } from "@octokit/rest";
const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH,
});

// init git
import { SimpleGit } from "simple-git";
let git: SimpleGit;

//
type slpIcon = {
  path: string;
  name: string;
  txid: string;
};
const processes: slpIcon[] = [];

//
async function selectMaster() {
  let remote = await git.remote([]);
  if (remote && !remote.split("\n").includes("upstream")) {
    await git
      .addRemote(
        "upstream",
        `https://github.com/${process.env.UPSTREAM_USER}/slp-token-icons.git`
      )
      .checkout("master");
  }
  //
  await git
    .checkout("master")
    .fetch("upstream", "master")
    .mergeFromTo("upstream/master", "origin/master")
    .push(["-u", "origin", "master"]);
}

//
async function photoProcess() {
  let { txid, path } = processes[0];
  const image = sharp(path);
  const metadata = await image.metadata();

  if (metadata.format === "svg") {
    await resize(path, 1000, txid, true);
    await image.toFile(`cache/repo/svg/${txid}.svg`);
  } else {
    // Move and convert to png
    await image.toFile(`cache/repo/original/${txid}.png`);
  }
  await resize(path, 128, txid);
  await resize(path, 64, txid);
  await resize(path, 32, txid);
}

//
async function setBranchName(_name: string) {
  let name = "token-" + _name.split(" ").join("-");
  let branchesName = (await git.branch()).branches;

  // check and use special branch name
  let loop = true;
  for (let i = 1; loop; i++) {
    let _name = `${name}-${i}`;
    if (!branchesName[_name]) {
      name = _name;
      loop = false;
    }
  }
  return name;
}

//
async function sendRequest() {
  // Remove space from " name " to "name"
  let name = processes[0].name.trim();

  // Replace space with -
  // Space not work in branch name
  let branch = await setBranchName(name);
  let message = `add ${name} token`;

  // Push icon of slp taq   oken in own repo
  await git
    .checkoutBranch(branch, "master")
    .add("./*")
    .commit(message, "*")
    .push("origin", branch);

  // Push pull request to https://github.com/kosinusbch/slp-token-icons
  const response = await octokit.request(`POST /repos/{owner}/{repo}/pulls`, {
    owner: process.env.UPSTREAM_USER,
    repo: "slp-token-icons",
    head: "slpkode:" + branch,
    base: "master",
    title: message,
    body: "Power by http://flipstarter.salemkode.com/",
  });

  return response.data.html_url;
}

//
export async function processIcon(icon?: slpIcon) {
  let removeIcon = () => {
    // delete first item in processes;
    fs.unlinkSync(processes[0].path);
    processes.shift();
  };
  try {
    // If no processes don't run function
    if (icon) {
      processes.push(icon);
    }

    // Stop If other process  or if we have not process now
    if (!processes[0] || (icon && processes.length !== 1)) {
      return;
    }

    //
    await selectMaster();
    await photoProcess();
    let pullRequest = await sendRequest();
    console.log(`${processes.length}: ${pullRequest}`);

    // delete first item in processes;
    removeIcon();

    // If array not empty  run processIcon again
    if (processes.length) {
      await processIcon();
    }

    // Return url
    return pullRequest;
  } catch (error) {
    removeIcon();
    console.error(error);
    throw error;
  }
}

//
export function setSimpleGit(_git: SimpleGit) {
  git = _git;
}

export function shift() {
  processes.shift();
}
//
export { selectMaster, processes };
