import { SourceMapGenerator } from "source-map";

export default class SourceMapper {
  #minifiedLocalFilePath;
  #sourceMaps;
  #minifiedItems = new Map();

  constructor({ minifiedLocalFilePath }) {
    this.#minifiedLocalFilePath = minifiedLocalFilePath;
    this.#sourceMaps = new SourceMapGenerator({ file: minifiedLocalFilePath });
  }

  #handleDeclaration({ loc: { start }, name }) {
    if (this.#minifiedItems.has(name)) {
      const nameMap = this.#minifiedItems.get(name);
      nameMap.positions.push(start);

      this.#minifiedItems.set(name, nameMap);
      return;
    }

    this.#minifiedItems.set(name, { positions: [start] });
  }
}
