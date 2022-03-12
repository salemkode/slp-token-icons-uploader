import { Request, Response, NextFunction, Application } from "express";
import { Send } from "express-serve-static-core";

//
export interface recaptchaSiteverify {
  success: true | false;
  challenge_ts: string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname: string;
}

//
export interface env {
  [key: string]: string;
  UPSTREAM_USER: string;
  REPO_OWNER: string;
  REPO_NAME: string;
  GITHUB_AUTH?: string;
  RE_CAPTCHA_KEY?: string;
}

/*
 * express
 */

// Application
export interface server extends Application {
  debug: {
    // Action logs
    action: (parm: string) => void;

    // Errors log problems that happen internally.
    errors: (parm: string) => void;

    // Status logs changes to the servers operational mode.
    status: (parm: string) => void;
  };
}

// middlewares
export interface expressMiddle<ReqBody = {}, Resbody = {}> {
  (
    req: TypedRequest<ReqBody>,
    res: TypedResponse<Resbody>,
    next: NextFunction
  ): void;
}

//
export interface TypedRequest<body> extends Request {
  body: body;
}

// Response
export interface TypedResponse<ResBody> extends Response {
  json: Send<ResBody, this>;
}
