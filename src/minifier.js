export default class Minifier {
  #nameMap = new Map();
  #alphabet = Array.from("abcdefghijklmnopqrstuvwxyz");

  #generateNameIfNotExisting(name) {
    if (this.#nameMap.has(name)) return this.#nameMap.get(name);

    if (!this.#alphabet)
      throw new Error("No more names available - limit is 52 tokens");

    return this.#alphabet.shift();
  }
}
