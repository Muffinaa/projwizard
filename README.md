# 🧙‍♂️ projwizard

[![npm version](https://img.shields.io/npm/v/projwizard?color=crimson&style=flat-square)](https://www.npmjs.com/package/projwizard)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Muffinaa/projwizard?style=flat-square)](https://github.com/Muffinaa/projwizard/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/Muffinaa/projwizard?style=flat-square)](https://github.com/Muffinaa/projwizard/issues)

**Create custom project setups with zero hassle.**  
`projwizard` is a flexible, zero-config CLI tool that helps you scaffold anything — from low-level C++ tools to modern full-stack web apps — using interactive prompts, post-gen logic, and community templates.

## 🚀 Features

- 📁 Scaffold projects using reusable templates
- 🎛️ Interactive setup with type-aware prompts
- 🧩 Add post-gen logic via optional `index.js`
- 🧠 Community-friendly — easy to contribute new templates
- 🔗 Works out of the box via `npx` — no global install needed

## 🛠️ Usage

```bash
npx projwizard
```

You’ll be asked to:

1. Name your project directory
2. Pick a template
3. Configure template-specific options
4. Confirm your setup
5. Let the wizard do the magic ✨

## 🧱 Creating a Template

Want to make a reusable starter for your stack of choice?
Just drop a new folder in the `templates/` directory!

### 📁 Template Folder Structure

```
templates/
└── my-template/
    ├── config.json       # Template metadata and user options
    ├── files/            # Files to copy into the new project
    └── index.js          # (Optional) Custom logic after generation
```

### 🧩 `config.json`

This is the core of your template — it defines how the wizard presents your template and prompts for configuration.

```json
{
  "name": "example",
  "tags": ["demo"],
  "author": "Muffinaa",
  "description": "A basic example template",
  "templateRepoLink": "https://github.com/Muffinaa/projwizard",
  "templateDeps": [],
  "postInstall": ["echo Done!"],
  "options": {
    "addBugs": {
      "type": "boolean",
      "description": "Make code a buggy mess"
    },
    "port": {
      "type": "number",
      "description": "Port to run the app on",
      "default": 3000
    },
    "projectAuthor": {
      "type": "string",
      "description": "Name of the author",
      "default": "author"
    }
  }
}
```

🗝️ Key fields:

- **`name`** – Display name shown in the CLI
- **`description`** – What your template does
- **`tags`** – Used for filtering templates
- **`templateRepoLink`** - Git repository of the repo

Optional fields:

- **`templateDeps`** – Modules to install _before_ running custom logic
- **`postInstall`** – Shell commands to run _after_ copying
- **`options`** – Custom prompts (boolean, string, number)

### ⚙️ `index.js` – Optional Custom Logic

If your template needs more control than simple shell commands, you can provide an `index.js`.
This file runs **after** the template is copied and offers full flexibility.

Use it to:

- Install dependencies based on user choices
- Modify files or perform templating logic
- Run any commands you like with full access to `exec`

```js
export default async function ({ projectDir, configOptions }) {
  //Your logic goes here
}
```

- `projectDir` — Path where the project was generated
- `configOptions` — Values selected by the user

## 📦 NPM

This tool is available via [npm](https://www.npmjs.com/package/projwizard).

```bash
npx projwizard
```

---

## 🧭 Project Links

- GitHub: [https://github.com/Muffinaa/projwizard](https://github.com/Muffinaa/projwizard)
- Issues: [https://github.com/Muffinaa/projwizard/issues](https://github.com/Muffinaa/projwizard/issues)
