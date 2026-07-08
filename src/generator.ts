import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  PACKAGE_JSON_TEMPLATE,
  GITIGNORE_TEMPLATE,
  ENV_TEMPLATE,
  CONFIG_TEMPLATE,
  README_TEMPLATE,
  MAIN_JSON_TEMPLATE,
  CHILD_JSON_TEMPLATE
} from "./templates.js";

const execAsync = promisify(exec);

export async function generateProject(projectDir: string, projectName: string, initGit: boolean): Promise<void> {
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

  if (initGit) {
    await execAsync("git init", { cwd: projectDir });
  }
}
