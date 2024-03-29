export default class Processor {
  static generateMinifiedFilePath(filename) {
    return filename.replace(".js", ".min.js");
  }
}
