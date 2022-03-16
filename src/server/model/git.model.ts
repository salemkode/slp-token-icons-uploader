import { SimpleGit } from "simple-git";
import Env from "./env.model";

//
export async function createBranch(git: SimpleGit, branch: string) {
  /*
   * git checkout master
   * git fetch upstream
   * git pull upstream master
   * git checkout -b branch-name
   */
  return await git
    .checkout("master")
    .fetch("upstream")
    .pull("upstream", "master")
    .checkoutBranch(branch, "master");
}

//
export async function pushBranch(git: SimpleGit, branch: string) {
  /*
   * git fetch upstream
   * git checkout branch-name
   * git add *
   * git commit "add ${branch-name} token"
   * git push --set-upstream origin branch-name
   * git checkout master
   */
  return await git
    .checkout(branch)
    .add("./*")
    .commit(`add ${branch} token`, "*")
    .push("origin", branch, ["--set-upstream"])
    // Go back to master
    .checkout("master"); 
}

//
export async function createBranchName(git: SimpleGit, name: string) {
  // add "token-" before name of token
  name = "token-" + name;

  // Remove space
  name = name.split(" ").join("-");

  // Get current branches name
  let branchesName = Object.keys((await git.branch()).branches);

  // Check and use special branch name
  for (let index = 1; true; index++) {
    // Generate name template token
    let index_name = name + `-${index}`;

    // Return the new name if it is unique
    if (!branchesName.includes(index_name)) {
      return index_name;
    }
  }
}

//
export async function setRemoteUrls(git: SimpleGit) {
  //
  let defaultRemotes: {
    [key: string]: unknown;
  } = getDefaultRemoteUrls();

  // For loop to set git remote url
  for (let remoteName in defaultRemotes) {
    // Get url of this remote name
    let remoteUrl = defaultRemotes[remoteName];

    if (typeof remoteUrl === "string") {
      try {
        // set new remote url
        await git.remote(["set-url", remoteName, remoteUrl]);
      } catch (error) {
        // Add remote if it not added
        await git.addRemote(remoteName, remoteUrl);
      }
    }
  }
}

//
export async function cloneRepo(git: SimpleGit) {
  return await git.clone(getDefaultRemoteUrls().origin, "cache/repo");
}

//
function getDefaultRemoteUrls() {
  // repo of upstream
  let upstream = `https://github.com/${Env.UPSTREAM_USER}/${Env.REPO_NAME}.git`;

  // repo of user server has access to it
  // repo: https://{user}:{token}@github.com/{user}/{repo_name}.git
  let origin = `https://${Env.REPO_OWNER}:${Env.GITHUB_AUTH}@github.com/${Env.REPO_OWNER}/${Env.REPO_NAME}.git`;

  return {
    upstream,
    origin,
  };
}
