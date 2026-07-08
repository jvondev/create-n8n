#!/usr/bin/env node
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { resolve, join, basename } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import pc from "picocolors";
import { intro, outro, text, confirm, spinner, log, isCancel, cancel } from "@clack/prompts";

const execAsync = promisify(exec);

const ASCII_ART = [
  "        ██████╗  █████╗ ██████╗ ",
  "        ██╔══██╗██╔══██╗██╔══██╗",
  "        ██║  ██║╚█████╔╝██║  ██║",
  "        ██║  ██║██╔══██╗██║  ██║",
  "        ██║  ██║╚█████╔╝██║  ██║",
  "        ╚═╝  ╚═╝ ╚════╝ ╚═╝  ╚═╝"
];

function showBranding(): void {
  process.stdout.write("\n");
  const color = "\x1b[38;2;234;75;113m"; // #EA4B71
  const reset = "\x1b[0m";
  process.stdout.write(`${color}${ASCII_ART.join('\n')}${reset}\n\n`);
}

const PACKAGE_JSON_TEMPLATE = (name: string) => `{
  "name": "${name}",
  "version": "1.0.0",
  "description": "An n8n workflow project powered by flat8n",
  "scripts": {
    "dev": "flat8n",
    "build": "flat8n link --entry workflows/main.json --out dist/main.json",
    "start": "npx n8n start"
  },
  "dependencies": {},
  "devDependencies": {
    "@flat8n/cli": "latest"
  }
}
`;

const GITIGNORE_TEMPLATE = `node_modules/
dist/
.env
.n8n/
`;

const ENV_TEMPLATE = `# The port your local n8n dev server runs on
N8N_PORT=5678

# The host your local n8n dev server binds to
N8N_HOST=localhost

# Security key for n8n encryption (change this in production)
N8N_ENCRYPTION_KEY=my-super-secret-encryption-key
`;

const CONFIG_TEMPLATE = `{
  "$schema": "https://flat8n.com/schema.json",
  "workflowsDir": "workflows",
  "outDir": "dist"
}
`;

const README_TEMPLATE = (name: string) => `# ${name}

[![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io)
[![flat8n](https://img.shields.io/badge/flat8n-FF6E4A.svg)](https://github.com/jvondev/flat8n)

A modern n8n workflow project, scaffolded with \`create-n8n\`.

## Development

Run the dev server (automatically starts a local n8n instance and watches your files for changes):

\`\`\`bash
npm run dev
\`\`\`

## Build

Compile your modular workflows into a single deployable monolithic JSON workflow:

\`\`\`bash
npm run build
\`\`\`

## Architecture

Your source workflows are in the \`workflows/\` directory.
Shared or reusable logic goes in \`workflows/subworkflows/\`.
`;

const MAIN_JSON_TEMPLATE = `{
  "name": "Main Entrypoint",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "test",
        "options": {}
      },
      "id": "1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [0, 0],
      "webhookId": "test-webhook"
    },
    {
      "parameters": {
        "workflowId": "child"
      },
      "id": "2",
      "name": "Execute Subworkflow",
      "type": "n8n-nodes-base.executeWorkflow",
      "typeVersion": 1,
      "position": [200, 0]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Execute Subworkflow",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
`;

const CHILD_JSON_TEMPLATE = `{
  "name": "Child Module",
  "id": "child",
  "nodes": [
    {
      "parameters": {},
      "id": "1",
      "name": "Execute Workflow Trigger",
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "return $input.all();"
      },
      "id": "2",
      "name": "Process Logic",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [200, 0]
    }
  ],
  "connections": {
    "Execute Workflow Trigger": {
      "main": [
        [
          {
            "node": "Process Logic",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
`;

async function main() {
  console.clear();
  showBranding();
  intro(pc.bgCyan(pc.black(" create-n8n ")));

  const cwd = process.cwd();

  const cwdFiles = await readdir(cwd);
  const allowedFiles = new Set([".git", ".DS_Store", ".vscode", ".idea", "Thumbs.db"]);
  const isCwdEmpty = cwdFiles.every((f: string) => allowedFiles.has(f));

  let targetDir = ".";

  if (!isCwdEmpty) {
    const dirPrompt = await text({
      message: "Project name (creates a new folder, or '.' for current directory)",
      placeholder: "my-n8n-app",
      defaultValue: "my-n8n-app",
      validate: (val) => {
        if (!val || val.length === 0) return "Project name is required";
        if (!/^[a-z0-9-_./]+$/.test(val)) return "Invalid path format";
        return;
      }
    });

    if (isCancel(dirPrompt) || typeof dirPrompt !== "string") {
      cancel("Initialization cancelled.");
      return process.exit(1);
    }
    targetDir = dirPrompt;

    if (targetDir === ".") {
      const confirmOverwrite = await confirm({
        message: "Current directory is not empty. Continue and potentially overwrite files?",
        initialValue: false
      });
      if (isCancel(confirmOverwrite) || !confirmOverwrite) {
        cancel("Initialization cancelled.");
        return process.exit(1);
      }
    }
  }

  const projectDir = resolve(cwd, targetDir);
  const projectName = targetDir === "." ? basename(cwd) : basename(projectDir);

  const initGit = await confirm({
    message: "Initialize a new Git repository?",
    initialValue: true
  });

  if (isCancel(initGit)) {
    cancel("Initialization cancelled.");
    return process.exit(1);
  }

  const s = spinner();
  s.start(`Creating project in ${projectDir}...`);

  try {
    // 1. Create Directories
    await mkdir(projectDir, { recursive: true });
    await mkdir(join(projectDir, "workflows"), { recursive: true });
    await mkdir(join(projectDir, "workflows", "subworkflows"), { recursive: true });

    // 2. Write Config / Root Files
    await writeFile(join(projectDir, "package.json"), PACKAGE_JSON_TEMPLATE(projectName));
    await writeFile(join(projectDir, ".gitignore"), GITIGNORE_TEMPLATE);
    await writeFile(join(projectDir, ".env.example"), ENV_TEMPLATE);
    await writeFile(join(projectDir, "flat8n.config.json"), CONFIG_TEMPLATE);
    await writeFile(join(projectDir, "README.md"), README_TEMPLATE(projectName));

    // 3. Write Workflows
    await writeFile(join(projectDir, "workflows", "main.json"), MAIN_JSON_TEMPLATE);
    await writeFile(join(projectDir, "workflows", "subworkflows", "child.json"), CHILD_JSON_TEMPLATE);

    s.stop(pc.green(`✔ Project scaffolded successfully in ${projectDir}`));

    if (initGit) {
      s.start("Initializing Git repository...");
      try {
        await execAsync("git init", { cwd: projectDir });
        s.stop(pc.green("✔ Git repository initialized"));
      } catch (err) {
        s.stop(pc.red("✖ Failed to initialize Git repository"));
      }
    }

    const cdInstruction = targetDir === "." ? "" : `  cd ${targetDir}\n`;
    log.info(`\n${pc.bold("Next steps:")}\n${cdInstruction}  npm install\n  npm run dev`);
    outro(pc.cyan("Happy automating! ") + pc.dim("— scaffolded by \x1b]8;;https://github.com/jvondev\x1b\\JVON DEV\x1b]8;;\x1b\\"));
    process.exit(0);

  } catch (error: any) {
    s.stop(pc.red("✖ Failed to create project"));
    log.error(error.message);
    process.exit(1);
  }
}

main().catch(console.error);
