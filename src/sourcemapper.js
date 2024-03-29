import { SourceMapGenerator } from "source-map";
import ASTHelper from "./ast-helper";
import * as acorn from "acorn";

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

  #generateSourceMapData({ nameMap, originalCode }) {
    const originalItems = [...nameMap.values()];

    this.#sourceMaps.setSourceContent(
      this.#minifiedLocalFilePath,
      originalCode,
    );

    originalItems.forEach(({ newName, positions }) => {
      const minifiedPositions = this.#minifiedItems.get(newName).positions;

      minifiedPositions.shift();
      minifiedPositions.forEach((minifiedPosition, index) => {
        const originalPositions = positions[index];

        const mappings = {
          source: this.#minifiedLocalFilePath,
          original: originalPositions,
          generated: minifiedPosition,
          name: newName,
        };

        this.#sourceMaps.addMapping(mappings);
      });
    });
  }

  generateSourceMap({ originalCode, minifiedCode, nameMap }) {
    const minifiedAST = acorn.parse(minifiedCode, {
      ecmaVersion: 2024,
      locations: true,
    });

    //    console.log({ minifiedAST });

    this.#traverse(minifiedAST);
    this.#generateSourceMapData({ nameMap, originalCode });

    const sourceMap = this.#sourceMaps.toString();

    //    console.log({ sourceMap });

    return sourceMap;
  }
}
