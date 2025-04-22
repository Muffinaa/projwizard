#!/usr/bin/env node
import { TemplateManager } from "../lib/TemplateManager.js";
import { ProjectConfig } from "../lib/ProjectConfig.js";
import { ProjectCreator } from "../lib/ProjectCreator.js";
import { GitHelper } from "../lib/GitHelper.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const tm = new TemplateManager(path.join(__dirname, "../templates"));
  await tm.loadTemplates();

  const config = new ProjectConfig(tm);
  const { projectName, chosenTemplate, configOptions } = await config.collect();
  const creator = new ProjectCreator(projectName, chosenTemplate, configOptions);

  if (chosenTemplate.templateRepoLink) await GitHelper.gitClone(chosenTemplate.templateRepoLink, creator.projectDir)
  await creator.copyTemplateFiles();

  const shouldInitGit = await config.confirmGitInit();
  if (shouldInitGit) await GitHelper.initRepo(creator.projectDir);

  if (chosenTemplate.installDeps?.length) await creator.installDeps();
  await creator.runLogic();
  if (chosenTemplate.postInstall?.length) await creator.postInstall();

  console.log(`# Done! Project created at ${projectName}`);
} catch (err) {
  console.error("! Project creation failed:", err);
  process.exit(1);
}
