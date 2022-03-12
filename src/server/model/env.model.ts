import "dotenv/config";
import { env } from "../interfaces";

// Default value
let Env: env = {
  UPSTREAM_USER: "kosinusbch",
  REPO_OWNER: "slpkode",
  REPO_NAME: "slp-token-icons",
  PORT: "3000",
};

//
for (let [key, value] of Object.entries(Env)) {
  // Replace default value with Environment variables
  Env[key] = process.env[key] || value;
}

//
export default Env;
