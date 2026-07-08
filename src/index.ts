#!/usr/bin/env node
import { readdir } from "node:fs/promises";
import { resolve, basename } from "node:path";
import pc from "picocolors";
import { intro, outro, text, confirm, spinner, log, isCancel, cancel } from "@clack/prompts";
import { showBranding } from "./ui.js";
import { generateProject } from "./generator.js";

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
    await generateProject(projectDir, projectName, initGit as boolean);
    s.stop(pc.green(`✔ Project scaffolded successfully in ${projectDir}`));

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
