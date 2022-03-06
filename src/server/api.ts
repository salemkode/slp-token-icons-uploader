import express, { Request, Response } from "express";
import Multer from "multer";
import sharp from "sharp";
import simpleGit from "simple-git";
import fs from "fs";
import { object, string } from "yup";
import "dotenv/config";

// init express router
const router = express.Router();
const uploader = Multer({ dest: "cache/uploads/" });

//
import {
  processIcon,
  setSimpleGit,
  selectMaster,
  shift,
  processes,
} from "./processIcon";
import axios, { AxiosResponse } from "axios";

//
async function formValidate(
  name: string,
  txid: string,
  recaptcha: string,
  icon: { path: string }
) {
  let errors: string[] = [];

  // init Schema
  let nameSchema = string().required("Name of token is a required field");

  let txidSchema = string()
    .required("Txid is a required field")
    .matches(/^(\S+$)/, "Txid field cannot contain blankspaces")
    .test("", "Txid is exists", (txid) => {
      return !fs.existsSync(`cache/repo/original/${txid}.png`);
    })
    .test("", "No slp token with this Txid", isValidateSlpTxid);

  let recaptchaSchema = await string()
    .required("recaptcha is empty")
    .test("", "recaptcha is not work", isValidateRecaptcha);

  let iconSchema = object({
    path: string()
      .required("You do not send file")
      .test("", "This icon is not square", isImageSquare),
  });

  // Validate schema
  await nameSchema.validate(name).catch((error) => errors.push(error.message));

  await txidSchema.validate(txid).catch((error) => errors.push(error.message));

  await recaptchaSchema
    .validate(recaptcha)
    .catch((error) => errors.push(error.message));

  await iconSchema.validate(icon).catch((error) => errors.push(error.message));

  if (errors.length == 0) {
    return true;
  } else {
    return errors;
  }
}

//
async function isValidateRecaptcha(token: string) {
  type validateToken = {
    success: true | false; // whether this request was a valid reCAPTCHA token for your site
  };

  // validate Token
  let { data }: AxiosResponse<validateToken> = await axios.get(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RE_CAPTCHA_KEY}&response=${token}`
  );

  return data.success;
}

//
async function isValidateSlpTxid(txid: string) {
  type validateTxid = {
    txid: string;
    valid: null | boolean;
  };

  // validate txid
  let { data }: AxiosResponse<validateTxid> = await axios.get(
    `https://api.fullstack.cash/v5/slp/validateTxid/${txid}`
  );

  return data.valid;
}

//
async function isImageSquare(path: string) {
  //
  const image = sharp(path);
  const metadata = await image.metadata();

  // check: Is image is square
  if (metadata.width !== metadata.height) {
    return false;
  }

  //
  return true;
}

//
async function init() {
  const git = simpleGit();

  // clone project
  if (!fs.existsSync("cache/repo")) {
    console.log("clone slp-token-icons project");
    let repo =
      "https://slpkode:" +
      process.env.GITHUB_AUTH +
      "@github.com/slpkode/slp-token-icons.git";
    await git.clone(repo, "cache/repo");
  }

  setSimpleGit(simpleGit("cache/repo"));
  await selectMaster();
}

//
async function upload({ file, body }: Request, res: Response) {
  if (!body) {
    return res.status(202).send({
      message: "No data",
    });
  }
  let { name, txid, "g-recaptcha-response": recaptcha, owner } = body;

  let validate = await formValidate(name, txid, recaptcha, file);

  if (validate !== true) {
    if (file) {
      shift();
      fs.unlinkSync(file.path);
    }
    return res.status(502).send({
      errors: validate,
    });
  }

  // Add icon to server Process
  let pullRequest = await processIcon({
    name,
    txid,
    owner,
    path: file.path,
  });

  // if server return pull request url
  if (pullRequest) {
    return res.status(201).send({
      message: "Your request has been successfully processed",
      url: pullRequest,
    });
  }

  // return message of Request is added to List
  res.status(202).send({
    message:
      "The image has been added to the list of resized images. then it will withdrawal pull request",
  });
}

// Call api when this route is requested.
router.post("/upload", uploader.single("icon"), upload);

router.get("/", async (req, res) => {
  res.send({
    processes,
  });
});

// Export init function to init in index file
export { init };

// Export router
export default router;
