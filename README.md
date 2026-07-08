<a id="readme-top"></a>

<div align="center">

# create-n8n

**The official scaffolding tool for modular n8n workflow projects.**

`create-n8n` generates a native, production-ready directory structure for building n8n workflows as code, powered by the flat8n compiler.

[![npm version](https://img.shields.io/npm/v/create-n8n.svg?style=for-the-badge&color=EA4B71)](https://www.npmjs.com/package/create-n8n)
[![n8n Compatible](https://img.shields.io/badge/n8n-Compatible-FF6E4A.svg?style=for-the-badge)](https://n8n.io)
[![flat8n Powered](https://img.shields.io/badge/flat8n-Powered-FF6E4A.svg?style=for-the-badge)](https://github.com/jvondev/flat8n)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Quick Start](#quick-start) &nbsp;•&nbsp;
[Why You Need This](#why-you-need-this) &nbsp;•&nbsp;
[Features](#features) &nbsp;•&nbsp;
[Architecture](#architecture)

</div>

## Quick Start

Run the interactive CLI wizard in your terminal to scaffold a new project:

```bash
npm create n8n@latest
```

The CLI prompts you for a project name, generates the required directory structure, configures the environment variables, and initializes a Git repository.

Once scaffolded, boot the local development environment:

```bash
cd your-project-name
npm install
npm run dev
```

## Why You Need This

Building n8n workflows through the browser UI is effective for small automations, but scales poorly for engineering teams. Version control becomes difficult, code reuse requires manual copy-pasting, and isolating environments introduces risk.

`create-n8n` bridges this gap by establishing a standard, code-first architecture. It integrates directly with `@flat8n/cli`, allowing you to write small, modular JSON workflows in your editor. The compiler then resolves cross-file dependencies and outputs a single, deterministic workflow ready for CI/CD deployment.

| Capability | Standard n8n Workspace | `create-n8n` Workspace |
|---|---|---|
| **Structure** | Unstructured exports. | Modular, domain-driven directories. |
| **Development** | Manual UI management. | Automated local dev server sync. |
| **Reusability** | Copy-paste nodes. | Shared sub-workflow modules. |
| **Security** | Embedded credentials. | `.env` isolated variables. |

## Features

- **Zero-config Environment.** The CLI provides a fully working local n8n instance synchronized with your file system out of the box.
- **Modular Compilation.** Build complex architectures by separating logic into sub-workflows. The underlying compiler merges them into a single deployable asset.
- **Hot Reloading.** Edit workflow structures in your code editor or the local n8n UI, and changes synchronize instantly across both.
- **Deterministic Builds.** The compiler generates stable Node IDs and Webhook IDs, ensuring production endpoints remain stable across deployments.
- **Secure Defaults.** Scaffolding includes `.gitignore` rules and `.env.example` templates to prevent credential leakage.

## Architecture

A project scaffolded with `create-n8n` uses a standard layout optimized for version control and modularity.

### Directory Layout

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

### Build Pipeline

The underlying compilation engine is the [`@flat8n/cli`](https://www.npmjs.com/package/@flat8n/cli) framework. When you execute `npm run build`, the compiler parses `main.json` and inlines all referenced `subworkflows` into a single deployable artifact located at `dist/main.json`.

> [!TIP]
> You can deploy the resulting `dist/main.json` to any production n8n instance without external dependencies. The output is a native, monolithic n8n workflow.

## License

MIT © [JVON DEV](https://github.com/jvondev)

<div align="center">

<a href="#readme-top">↑ back to top</a>

</div>
