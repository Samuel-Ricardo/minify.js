import ASTHelper from "./ast-helper";

export default class Minifier {
  #nameMap = new Map();
  #alphabet = Array.from("abcdefghijklmnopqrstuvwxyz");

  #generateNameIfNotExisting(name) {
    if (this.#nameMap.has(name)) return this.#nameMap.get(name);

    if (!this.#alphabet)
      throw new Error("No more names available - limit is 52 tokens");

    return this.#alphabet.shift();
  }

  #updateNameMap(oldName, newName, { loc: { start } }) {
    if (this.#nameMap.has(oldName)) {
      const nameMap = this.#nameMap.get(oldName);
      nameMap.positions.push(start);

      this.#nameMap.set(oldName, nameMap);
      return;
    }

    this.#nameMap.set(oldName, { newName, positions: [start] });
  }

  #handleDeclaration(declaration) {
    const oldName = declaration.name;
    const newName = this.#generateNameIfNotExisting(oldName);

    this.#updateNameMap(oldName, newName, declaration);
    declaration.name = newName;
  }

  #traverse(node) {
    const helper = new ASTHelper();
    helper
      .setVariableDeclarationHook((node) => {
        for (const declaration of node.declarations) {
          this.#handleDeclaration(node.id);
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
        const name = this.#nameMap.get(oldName)?.newName;
        if (!name) return;

        this.#updateNameMap(oldName, name, node);
        node.name = name;
      })
      .traverse(node);
  }
}
