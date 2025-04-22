import { readFileSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";

export class TemplateManager {
  constructor(templateDir) {
    this.templateDir = templateDir;
    this.templates = [];
  }

  async loadTemplates() {
    const dirs = await readdir(this.templateDir, { withFileTypes: true });
    this.templates = dirs
      .filter((d) => d.isDirectory())
      .map((d) => {
        const cfgPath = path.join(this.templateDir, d.name, "config.json");
        return {
          id: d.name,
          path: path.join(this.templateDir, d.name),
          ...JSON.parse(readFileSync(cfgPath, "utf8")),
        };
      });
  }

  getTemplates() {
    return this.templates;
  }

  getTemplateById(id) {
    return this.templates.find((t) => t.id === id);
  }
}
