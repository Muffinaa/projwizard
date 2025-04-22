import fs from "fs-extra"
import path from "path";
import { promisify } from "util";
import { exec } from "child_process"

const execAsync = promisify(exec);

export class ProjectCreator {
  constructor(projectName, chosenTemplate, configOptions) {
    this.projectName = projectName
    this.chosenTemplate = chosenTemplate
    this.configOptions = configOptions
    this.projectDir = path.join(process.cwd(), this.projectName)
  }

  async copyTemplateFiles() {
    console.log(`- Copied template files`)
    await fs.copy(path.join(this.chosenTemplate.path, "files"), this.projectDir);
  }

  async runLogic() {
    const logicPath = path.join(this.chosenTemplate.path, "index.js")
    if (fs.existsSync(logicPath)) {
      const run = (await import(logicPath)).default;
      if (typeof run === "function") {
        console.log(`- Running template logic`)
        await run({ projectDir: this.projectDir, configOptions: this.configOptions });
      }
    }
  }

  async installDeps() {
    const deps = this.chosenTemplate.templateDeps.join(" ");
    try {
      console.log(`- Installing run dependencies: ${deps}`)
      await execAsync(`npm install ${deps}`, { cwd: this.projectDir });
    } catch (err) {
      console.error(`! Failed to install runtime dependencies ${deps}:`, err.message);
    }
  }

  async postInstall() {
    for (const cmd of this.chosenTemplate.postInstall) {
      console.log(`- Executing: ${cmd}`)
      try {
        await execAsync(cmd, { cwd: this.projectDir });
      } catch (err) {
        console.error("! Failed to execute ${cmd}", err.message);
      }
    }
  }
}
