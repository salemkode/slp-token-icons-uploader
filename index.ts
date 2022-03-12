import ranidb from "ranidb";

let processes = new ranidb("db/processes.json");

processes.delete(0);
