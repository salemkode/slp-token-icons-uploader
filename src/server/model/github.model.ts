import { Octokit } from "@octokit/rest";

// Init github api
const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH,
});

export async function createPullRequest(
  name: string, // Name of Token
  txid: string, // txid (Token id)
  branchName: string, // branch name to create PR from it
  message?: string // Message from owner (optional)
) {
  // Remove space from start and end
  name = name.trim();

  // Make array of body
  // Every item is line in pullrequest body
  let bodyArray = [`Name: ${name}`, `Token id: ${txid}`];

  // Add token message if he available
  if (message) {
    bodyArray.push(`Message:`, message);
  }

  // Push footer of body
  bodyArray.push(
    "This process was done in an automated through a website https://slp-icons-uploader.salemkode.com/"
  );

  // Push pull request to https://github.com/kosinusbch/slp-token-icons
  const response = await octokit.request(`POST /repos/{owner}/{repo}/pulls`, {
    owner: process.env.UPSTREAM_USER,
    repo: "slp-token-icons",
    head: "slpkode:" + branchName,
    base: "master",
    title: `add ${name} coin token`,
    body: bodyArray.join("<br><br>"),
  });

  // Return url of PR
  return response.data.html_url;
}
