import { io, app } from "../../index";

//
function emit(room: string, name: string, ...args: any[]) {
  return io.to(room).emit(name, ...args);
}

//
export function action(msg: string, processId: string) {
  emit(processId, "update process", msg);
  app.debug.action(msg);
}

//
export function complete(msg: string, processId: string, url: string) {
  emit(processId, "complete process", msg, url);
  app.debug.action(msg);
}
