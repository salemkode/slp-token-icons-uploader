// Just for now
import express from "express";
import Multer from "multer";
import * as socket from "../model/socket.model";

import { uploadIcon } from "../controllers/upload.controllers";
import recaptcha_middle from "../middlewares/recaptcha.middleware";
import uploadValidator from "../validator/upload.validator";

const uploader = Multer({ dest: "cache/uploads" });
const router = express.Router();

// Call api when this route is requested.
router.post(
  "/upload",
  uploader.single("icon"),
  recaptcha_middle,
  uploadValidator,
  uploadIcon
);

// Export router
export default router;
