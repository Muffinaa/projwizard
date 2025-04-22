import fs from "fs-extra"
import { promisify } from "util";
import { exec } from "child_process"
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);

export class GitHelper {
  static async initRepo(path) {
    try {
      await execAsync("git init && git add . && git commit -m 'Initial commit'", {
        cwd: path,
      });
      console.log("# Git repository initialized.");
    } catch (err) {
      console.error("! Failed to initialize git:", err.message);
    }
  }

  static async gitClone(repoLink, dest) {
    console.log("- Cloning template files");
    try {
      await execAsync(`git clone ${repoLink} ${dest} --depth 1`, { cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url))) })
      await fs.remove(path.join(dest, ".git"))
    } catch (err) {
      console.error("! Failed to git clone a repository:", err.message);
    }
  }
}
