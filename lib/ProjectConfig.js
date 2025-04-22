import { input, select, number, confirm } from "@inquirer/prompts";

export class ProjectConfig {
  constructor(templateManager) {
    this.templateManager = templateManager;
  }

  async collect() {
    const templates = this.templateManager.getTemplates();

    const projectName = await input({
      message: "What should the project be called?",
      validate: (name) => (name ? true : "Project name cannot be empty"),
    });

    const templateId = await select({
      message: "Which template do you want to use?",
      choices: templates.map((t) => ({
        title: t.name,
        value: t.id,
        description: `${t.name}\nTags: ${t.tags?.join(", ")}\n${t.description}`,
      })),
    });

    const chosenTemplate = this.templateManager.getTemplateById(templateId);
    const configOptions = await this._promptOptions(chosenTemplate);

    return { projectName, chosenTemplate, configOptions };
  }

  async confirmGitInit() {
    return await confirm({
      message: "Initialize a git repository?",
      default: true,
    });
  }

  async _promptOptions(template) {
    const options = {};
    const types = { boolean: confirm, number, string: input };

    for (const [key, opt] of Object.entries(template.options || {})) {
      const promptFn = types[opt.type];
      if (!promptFn) {
        console.warn(`Unknown prompt type for ${key}`);
        continue;
      }

      options[key] = await promptFn({
        message: opt.description || key,
        default: opt.default,
      });
    }

    return options;
  }
}
