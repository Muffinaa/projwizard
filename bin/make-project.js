#!/usr/bin/env node
import { readdir } from "fs/promises";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { select } from "@inquirer/prompts";
import fsExtra from "fs-extra";

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

async function main() {
  const templates = await loadTemplates();

  const templateId = await select({
    message: "Which template do you want to scaffold?",
    choices: templates.map((t) => ({
      title: t.name,
      value: t.id,
      description: t.tags?.join(", "),
    })),
  });

  const chosen = templates.find((t) => t.id === templateId);
  const dest = path.join(process.cwd(), chosen.id);

  await fsExtra.copy(path.join(chosen.path, "files"), dest);
  console.log(`✓ Generated ${chosen.name} in ./${chosen.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
