<div align="center">

# create-n8n

[![npm version](https://img.shields.io/npm/v/create-n8n.svg?style=for-the-badge&color=EA4B71)](https://www.npmjs.com/package/create-n8n)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Quickstart](#quickstart) · [Features](#features) · [Architecture](#architecture)

Scaffold a modern, modular n8n project in seconds.

</div>

> [!NOTE]
> `create-n8n` is the official scaffolding CLI for building n8n workflows as code. It sets up a local development environment, configures your file structure, and installs the necessary compilers.

## Quickstart

Run the CLI wizard in your terminal to scaffold a new project:

```bash
npm create n8n@latest
```

Follow the interactive prompts to name your project and set up your directory. The CLI creates the folder, initializes the configuration, and sets up your Git repository automatically.

Once scaffolded, start your local n8n development server:

```bash
cd your-project-name
npm install
npm run dev
```

## Features

- ⚡ **Zero Configuration** — Get a fully working n8n development environment running locally in seconds.
- 🧩 **Modular Workflows** — Build complex automations by splitting them into smaller, testable sub-workflows.
- 📦 **Monolithic Compilation** — Compile your modular files into a single, deployable JSON file using the built-in `@flat8n/cli` compiler.
- 🔄 **Hot Reloading** — Edit your workflows in code or via the local n8n UI, and watch changes sync instantly.
- 🔐 **Secure Defaults** — Scaffolds with a `.gitignore` and `.env.example` to prevent accidental credential leaks.

## Architecture

A project scaffolded with `create-n8n` uses a standard directory structure optimized for version control and modularity.

### What This Looks Like

```text
my-n8n-app/
├── workflows/
│   ├── main.json             # The primary entrypoint workflow
│   └── subworkflows/
│       └── child.json        # Reusable workflow modules
├── .env.example              # Environment variable templates
├── .gitignore                # Prevents committing secrets
├── flat8n.config.json        # Compiler configuration
└── package.json              # Scripts (dev, build, start)
```

### Under the Hood

The heavy lifting (compilation, deterministic IDs, graph merging) is powered by the [`@flat8n/cli`](https://www.npmjs.com/package/@flat8n/cli) framework. When you run `npm run build`, the compiler merges your `main.json` and all `subworkflows` into a single deployable asset (`dist/main.json`).

> [!TIP]
> You can deploy the resulting `dist/main.json` to any production n8n instance. Because the compiler generates deterministic Node IDs and Webhook IDs, your production URLs will not break across deployments.

## License

MIT © [JVON DEV](https://github.com/jvondev)
