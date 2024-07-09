import { writeFileSync } from "node:fs";
import jsr_json from "./jsr.json" assert { type: "json" };
import package_json from "./package.json" assert { type: "json" };

jsr_json.version = package_json.version;

writeFileSync("jsr.json", JSON.stringify(jsr_json, null, 2));
