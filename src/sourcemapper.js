import { SourceMapGenerator } from "source-map";
import ASTHelper from "./ast-helper";

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

  #traverse(node) {
    const helper = new ASTHelper();

    helper
      .setVariableDeclarationHook((node) => {
        for (const declaration of node.declarations) {
          this.#handleDeclaration(declaration);
        }
      })
      .setFuncionDeclarationHook((node) => {
        this.#handleDeclaration(node.id);
        for (const param of node.params) {
          this.#handleDeclaration(param);
        }
      })
      .setIdentifierHook((node) => {
        const oldName = node.name;
        const name = this.#minifiedItems.get(oldName);
        if (!name) return;

        this.#handleDeclaration(node);
        node.name = name;
      })
      .traverse(node);
  }
}
