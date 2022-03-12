import Debug from "debug";
import { Application } from "express";
import { server } from "../interfaces";

export default function (app: Application): server {
  Debug.enable("server:action,server:errors,server:status");

  // Init Debug object
  let debug = {
    // Action logs
    action: Debug("server:action"),

    // Errors log problems that happen internally.
    errors: Debug("server:errors"),

    // Status logs changes to the servers operational mode.
    status: Debug("server:status"),
  };

  // Create app with debug
  let newApp: server = Object.assign(app, { debug });

  // Notify the user that logging has been initialized.
  newApp.debug.status("Completed logging initialization.");

  return newApp;
}
