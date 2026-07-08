export const PACKAGE_JSON_TEMPLATE = (name: string) => `{
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

export const GITIGNORE_TEMPLATE = `node_modules/
dist/
.env
.n8n/
`;

export const ENV_TEMPLATE = `# The port your local n8n dev server runs on
N8N_PORT=5678

# The host your local n8n dev server binds to
N8N_HOST=localhost

# Security key for n8n encryption (change this in production)
N8N_ENCRYPTION_KEY=my-super-secret-encryption-key
`;

export const CONFIG_TEMPLATE = `{
  "$schema": "https://flat8n.com/schema.json",
  "workflowsDir": "workflows",
  "outDir": "dist"
}
`;

export const README_TEMPLATE = (name: string) => `# ${name}

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

export const MAIN_JSON_TEMPLATE = `{
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

export const CHILD_JSON_TEMPLATE = `{
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
