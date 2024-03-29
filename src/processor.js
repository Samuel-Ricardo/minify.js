import Minifier from "./minifier";
import fs from "node:fs";

export default class Processor {
  static generateMinifiedFilePath(filename) {
    return filename.replace(".js", ".min.js");
  }

  static #generateMinifiedCode({
    originalCode,
    minifiedFilePath,
    minifiedLocalFilePath,
  }) {
    const minifier = new Minifier();
    const { minifiedCode, nameMap } =
      minifier.minifyCodeAndReturnMapNames(originalCode);

    const sourceMapURL = `//# sourceMappingURL=${minifiedLocalFilePath}.map`;

    fs.writeFileSync(minifiedFilePath, `${minifiedFilePath}\n${sourceMapURL}`);

    return {
      minifiedCode,
      nameMap,
    };
  }
}
