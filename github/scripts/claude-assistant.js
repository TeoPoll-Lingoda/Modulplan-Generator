const Anthropic = require("@anthropic-ai/sdk");
const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const issueNumber = parseInt(process.env.ISSUE_NUMBER);
const commentBody = process.env.COMMENT_BODY;

// Strip the @claude mention and get the actual instruction
const userInstruction = commentBody.replace(/@claude/gi, "").trim();

// Gather repo file tree (top-level, depth-limited to avoid huge repos)
function getFileTree(dir = ".", depth = 2, currentDepth = 0) {
  if (currentDepth >= depth) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFileTree(fullPath, depth, currentDepth + 1));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const tools = [
  {
    name: "read_file",
    description: "Read the contents of a file in the repository.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the file (relative to repo root)" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write or overwrite a file in the repository.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the file (relative to repo root)" },
        content: { type: "string", description: "Full content to write to the file" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_files",
    description: "List files in a directory.",
    input_schema: {
      type: "object",
      properties: {
        directory: { type: "string", description: "Directory path (relative to repo root)", default: "." },
      },
    },
  },
  {
    name: "post_comment",
    description: "Post a reply comment on the GitHub issue or PR.",
    input_schema: {
      type: "object",
      properties: {
        message: { type: "string", description: "The markdown comment to post." },
      },
      required: ["message"],
    },
  },
];

function handleTool(toolName, toolInput) {
  if (toolName === "read_file") {
    try {
      return fs.readFileSync(toolInput.path, "utf8");
    } catch (e) {
      return `Error reading file: ${e.message}`;
    }
  }

  if (toolName === "write_file") {
    try {
      fs.mkdirSync(path.dirname(toolInput.path), { recursive: true });
      fs.writeFileSync(toolInput.path, toolInput.content, "utf8");
      return `Successfully wrote ${toolInput.path}`;
    } catch (e) {
      return `Error writing file: ${e.message}`;
    }
  }

  if (toolName === "list_files") {
    try {
      const dir = toolInput.directory || ".";
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      return entries
        .filter((e) => !e.name.startsWith(".") && e.name !== "node_modules")
        .map((e) => `${e.isDirectory() ? "[dir]" : "[file]"} ${path.join(dir, e.name)}`)
        .join("\n");
    } catch (e) {
      return `Error listing files: ${e.message}`;
    }
  }

  return "Unknown tool";
}

async function postComment(message) {
  await octokit.issues.createComment({ owner, repo, issue_number: issueNumber, body: message });
}

async function commitChanges() {
  // Check for any modified/new files and commit them
  const { execSync } = require("child_process");
  try {
    execSync("git config user.name 'Claude Assistant'");
    execSync("git config user.email 'claude-assistant@github-actions'");
    const status = execSync("git status --porcelain").toString().trim();
    if (!status) return null;

    execSync("git add -A");
    execSync(`git commit -m "chore: Claude edits from issue #${issueNumber}"`);
    execSync("git push");

    return status
      .split("\n")
      .map((l) => l.trim())
      .join(", ");
  } catch (e) {
    return null;
  }
}

async function main() {
  const fileTree = getFileTree(".", 3).join("\n");

  const systemPrompt = `You are Claude, an AI assistant embedded in a GitHub repository via GitHub Actions.
You can read files, write files, and post comments on issues and PRs.
The repository file tree is:
\`\`\`
${fileTree}
\`\`\`
When you edit files, be precise. After making edits, summarize what you did in a post_comment call.
Always end your work by calling post_comment with a clear summary of actions taken.`;

  const messages = [{ role: "user", content: userInstruction }];

  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    tools,
    messages,
  });

  // Agentic loop
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const toolResults = [];
    let postedComment = false;

    for (const toolUse of toolUseBlocks) {
      let result;
      if (toolUse.name === "post_comment") {
        await postComment(toolUse.input.message);
        result = "Comment posted successfully.";
        postedComment = true;
      } else {
        result = handleTool(toolUse.name, toolUse.input);
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: result,
      });
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    });
  }

  // Commit any file changes
  const changed = await commitChanges();

  // If Claude didn't post a comment via tool, post its final text response
  const finalText = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  if (finalText) {
    const suffix = changed ? `\n\n---\n📝 **Files changed:** ${changed}` : "";
    await postComment(finalText + suffix);
  } else if (changed) {
    await postComment(`✅ Done! Files changed: ${changed}`);
  }
}

main().catch(async (err) => {
  console.error(err);
  await postComment(`❌ Claude encountered an error: \`${err.message}\``);
  process.exit(1);
});
