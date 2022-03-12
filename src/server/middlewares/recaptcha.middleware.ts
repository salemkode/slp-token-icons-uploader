import axios, { AxiosResponse } from "axios";
import { recaptchaSiteverify, expressMiddle } from "../interfaces";

//
let recaptcha_middle: expressMiddle<{ "g-recaptcha-response": string }> =
  async function (req, res, next) {
    //
    if (!req.body) {
      return res.json({
        error: "Please send body",
      });
    }

    //
    let { "g-recaptcha-response": recaptcha_token } = req.body;

    // validate Token
    let { data }: AxiosResponse<recaptchaSiteverify> = await axios.get(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RE_CAPTCHA_KEY}&response=${recaptcha_token}`
    );

    //
    if (data.success) {
      next();
    } else {
      return res.json({
        error: "Validate recaptcha first",
      });
    }
  };

//
export default recaptcha_middle;
