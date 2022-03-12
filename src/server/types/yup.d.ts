import { StringSchema } from "yup";
import { Message } from "yup/lib/types";

declare module "yup" {
  interface StringSchema {
    existsTxid(msg?: Message<{}>): StringSchema;
    slpTxid(msg?: Message<{}>): StringSchema;
    squareImage(msg?: Message<{}>): StringSchema;
  }
}

export const date: StringSchema;
