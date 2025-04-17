#!/usr/bin/env node
import { confirm, input, number, select } from "@inquirer/prompts";
import { exec } from "child_process";
import { readFileSync } from "fs";
import fsExtra from "fs-extra";
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadTemplates() {
  const base = path.join(__dirname, "../templates");
  const dirs = await readdir(base, { withFileTypes: true });
  return dirs
    .filter((d) => d.isDirectory())
    .map((d) => {
      const cfgPath = path.join(base, d.name, "config.json");
      const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
      return { id: d.name, path: path.join(base, d.name), ...cfg };
    });
}

async function initGitRepo(destDir) {
  try {
    await execAsync("git init", { cwd: destDir });
    await execAsync("git add .", { cwd: destDir });
    await execAsync('git commit -m "Initial commit"', { cwd: destDir });

    console.log("✓ Git repository initialized.");
  } catch (err) {
    console.error("⚠️ Failed to initialize git:", err.message);
  }
}

async function main() {
  const templates = await loadTemplates();

  const projectName = await input({
    message: "What should the project be called?",
    validate: (name) => (name ? true : "Project name cannot be empty"),
  });

  const templateId = await select({
    message: "Which template do you want to scaffold?",
    choices: templates.map((t) => ({
      title: t.name,
      value: t.id,
      description: `\n${t.name}\n\nTags: ${t.tags?.join(", ")}\n\n${t.description}`,
    })),
  });

  const chosen = templates.find((t) => t.id === templateId);

  let configOptions = {};

  for (const [key, opt] of Object.entries(chosen.options)) {
    const message = `${opt.description || key}`;

    let value;
    switch (opt.type) {
      case "boolean":
        value = await confirm({ message, default: opt.default });
        break;
      case "number":
        value = await number({ message, default: opt.default });
        break;
      case "string":
        value = await input({ message, default: opt.default });
        break;
      default:
        console.warn(`Unknown type for ${key}, skipping`);
        continue;
    }

    configOptions[key] = value;
  }

  console.log(configOptions);

  const dest = path.join(process.cwd(), projectName);

  await fsExtra.copy(path.join(chosen.path, "files"), dest);
  console.log(`✓ Generated ${chosen.name} in ./${projectName}`);
  await initGitRepo(dest);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
