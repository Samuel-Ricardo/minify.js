import { SourceMapGenerator } from "source-map";

export default class SourceMapper {
  #minifiedLocalFilePath;
  #sourceMaps;
  #minifiedItems = new Map();

  constructor({ minifiedLocalFilePath }) {
    this.#minifiedLocalFilePath = minifiedLocalFilePath;
    this.#sourceMaps = new SourceMapGenerator({ file: minifiedLocalFilePath });
  }
}
