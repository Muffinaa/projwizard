#!/usr/bin/env node
import fs from "fs-extra";
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
const rootDir = path.resolve(__dirname);

async function loadTemplates() {
  const base = path.join(__dirname, "../templates");
  return (await readdir(base, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => {
      const cfgPath = path.join(base, d.name, "config.json");
      return {
        id: d.name,
        path: path.join(base, d.name),
        ...JSON.parse(readFileSync(cfgPath, "utf8")),
      };
    });
}

async function initGitRepo(destDir) {
  try {
    await execAsync("git init && git add . && git commit -m 'Initial commit'", {
      cwd: destDir,
    });

    console.log("# Git repository initialized.");
  } catch (err) {
    console.error("! Failed to initialize git:", err.message);
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
      description: `${t.name}\nTags: ${t.tags?.join(", ")}\n${t.description}`,
    })),
  });

  const chosen = templates.find((t) => t.id === templateId);

  let configOptions = {};

  const optionsTypes = {
    boolean: confirm,
    number: number,
    string: input,
  };

  for (const [key, opt] of Object.entries(chosen.options)) {
    const message = `${opt.description || key}`;
    if (!(opt.type in optionsTypes)) {
      console.warn(`Unknown type for ${key}, skipping`);
      continue;
    }
    configOptions[key] = await optionsTypes[opt.type]({
      message,
      default: opt.default,
    });
  }

  const dest = path.join(process.cwd(), projectName);
  await fsExtra.copy(path.join(chosen.path, "files"), dest);

  if (
    await confirm({
      message: "Initialize a git repository?",
      default: true,
    })
  )
    initGitRepo(dest);

  const logicPath = path.join(chosen.path, "index.js");

  if (chosen.templateDeps?.length) {
    const deps = chosen.templateDeps.join(" ");
    console.log(`+ Installing template runtime deps: ${deps}`);
    await execAsync(`npm install ${deps}`, { cwd: rootDir });
  }

  if (fs.existsSync(logicPath)) {
    const run = (await import(logicPath)).default;
    if (typeof run === "function") {
      await run({ projectDir: dest, configOptions });
    }
  }

  if (chosen.postInstall) {
    for (const cmd of chosen.postInstall) {
      console.log(`- Running: ${cmd}`);
      await execAsync(cmd, { cwd: dest });
    }
  }

  console.log(`# Done! Project created at ${projectName}`);
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
