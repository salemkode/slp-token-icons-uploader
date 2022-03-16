import { SimpleGit } from "simple-git";
import { server, TypedResponse } from "../interfaces";
import { Request } from "express";
import { addProcess } from "../model/mutex.model";

//
let git: SimpleGit;

// Upload Response status
type successRes = {
  processId: string;
};

type errorsRes = {
  error: string[] | string;
};

// Export controllers
export async function uploadIcon(
  req: Request<
    {},
    {
      name: string;
      txid: string;
      message: string;
    }
  >,
  res: TypedResponse<successRes | errorsRes>
) {
  //
  let { name, txid, message, isTest } = req.body;

  //
  let app = req.app! as server;
  app.debug.action("New Image upload start");

  //
  let processId = addProcess(git, { name, txid, message, isTest, file: req.file });

  //
  return res.json({
    processId,
  });
}

// Set git object
export function setSimpleGit(_git: SimpleGit) {
  git = _git;
}
