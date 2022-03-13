import { isFileSupport, isSquare } from "../model/photo.model";
import fs from "fs";
import axios, { AxiosResponse } from "axios";
import { NextFunction, Request, Response } from "express";

//
function hasWhiteSpace(string: string) {
  return /\s/g.test(string);
}

//
export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let { name, txid } = req.body;

  //
  let errors: {
    name?: string;
    txid?: string;
    icon?: string;
  } = {};
  let valid = true;

  // Chack name
  if (!name) {
    errors.name = "Name is required";
    valid = false;
  }

  // Chack txid
  let isTxidValidate = await txidValidate(txid);
  if (typeof isTxidValidate === "string") {
    errors.txid = isTxidValidate;
    valid = false;
  }

  // Icon Check
  let isIconValidate = await iconValidate(req.file);
  if (typeof isIconValidate === "string") {
    errors.icon = isIconValidate;
    valid = false;
  }

  //
  if (valid) {
    next();
  } else {
    res.status(422).json({ error: errors });
  }
}

//
async function txidValidate(txid: string) {
  // Check is txid
  if (!txid) return "(Token id) is required";

  // Chack if txid have space
  if (hasWhiteSpace(txid)) return "Txid field cannot contain blankspaces";

  // Check is (Token id) is exists
  if (fs.existsSync(`cache/repo/original/${txid}.png`)) {
    return "(Token id) already exists";
  }

  // validate txid
  let { data }: AxiosResponse<{ valid: null | boolean }> = await axios.get(
    `https://api.fullstack.cash/v5/slp/validateTxid/${txid}`
  );

  //
  return data.valid ? true : "(Token id) is invalid";
}

//
async function iconValidate(file: Express.Multer.File) {
  if (file && file.path) {
    let imagePath = file.path;

    // Check is type of file support
    let isIconSupport = await isFileSupport(imagePath);
    if (!isIconSupport) return "token icon not support";

    // Check if image is square
    let isIconSquare = await isSquare(imagePath);

    // Return Error msg when image not square
    return isIconSquare ? true : "token icon must be square";
  } else {
    return "You should upload a token icon";
  }
}
