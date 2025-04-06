const fs = require("fs");
const path = require("path");
const prompts = require("prompts");
const { LocalWorkspace } = require("@pulumi/pulumi/automation");
const { execSync } = require("child_process");

function checkCLI(command, name) {
  try {
    execSync(command, { stdio: "ignore" });
    console.log(`✅ ${name} CLI is installed`);
    return true;
  } catch {
    console.error(`❌ ${name} CLI is not installed. Please install it first.`);
    return false;
  }
}

function checkPulumiLogin() {
  try {
    const user = execSync("pulumi whoami", { stdio: "pipe" }).toString().trim();
    console.log(`🔐 Logged in as ${user}`);
    return true;
  } catch {
    console.error("⚠️  Pulumi CLI is not logged in. Run `pulumi login` and try again.");
    return false;
  }
}

function checkAwsConfigured() {
  try {
    const identity = execSync("aws sts get-caller-identity", { stdio: "pipe" }).toString();
    const parsed = JSON.parse(identity);
    console.log(`🧾 AWS Configured for Account: ${parsed.Account}, ARN: ${parsed.Arn}`);
    return true;
  } catch {
    console.error("❌ AWS CLI is not configured. Run `aws configure` with your IAM credentials first.");
    return false;
  }
}

async function initProject(options = {}) {
  const useGitHub = options.github || false;

  console.log("🔍 Checking environment...");
  const PulumiCheck = checkCLI("pulumi version", "Pulumi");
  if (!PulumiCheck) process.exit(1);

  if (useGitHub) {
    const { repoName, description, deployDir, stackName, githubToken } = await prompts([
      {
        type: "text",
        name: "repoName",
        message: "GitHub repo name:",
        initial: path.basename(process.cwd()),
      },
      {
        type: "text",
        name: "description",
        message: "Repo description:",
      },
      {
        type: "text",
        name: "deployDir",
        message: "Directory to deploy (e.g., ./build):",
        initial: "./build",
      },
      {
        type: "text",
        name: "stackName",
        message: "Stack name:",
        initial: "github-pages",
      },
      {
        type: "password",
        name: "githubToken",
        message: "Enter your github token",
      },
    ]);

    const githubConfig = {
      projectName: repoName,
      description,
      deployDir,
      stackName,
      githubToken,
      target: "github",
    };

    fs.writeFileSync("config.json", JSON.stringify(githubConfig, null, 2));
    console.log("✅ GitHub Pages project initialized and saved to config.json");
    return;
  }

  // For AWS S3 setup
  const hasAws = checkCLI("aws --version", "AWS");
  const isPulumiLoggedIn = checkPulumiLogin();
  const isAwsConfigured = checkAwsConfigured();

  if (!hasAws || !isPulumiLoggedIn || !isAwsConfigured) {
    process.exit(1);
  }

  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "Pulumi",
    },
    {
      type: "text",
      name: "stackName",
      message: "Stack name:",
      initial: "dev",
    },
    {
      type: "text",
      name: "projectDescription",
      message: "Project Description:",
      initial: "This is a cool project",
    },
    {
      type: "text",
      name: "region",
      message: "AWS region:",
      initial: "us-east-1",
    },
    {
      type: "confirm",
      name: "generateSite",
      message: "Create a sample index.html?",
      initial: true,
    },
  ]);

  const config = {
    projectName: response.projectName,
    stackName: response.stackName,
    projectDescription: response.projectDescription,
    region: response.region,
    target: "aws",
  };

  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
  console.log("📦 Saved all config → config.json");

  // Create sample static site
  const publicDir = path.join(process.cwd(), "public");
  if (response.generateSite && !fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
    fs.writeFileSync(
      path.join(publicDir, "index.html"),
      `<html><body><h1>Pulumi is awesome broo!🔥</h1></body></html>`
    );
    console.log("🌐 Created sample static site in ./public/");
  }

  // Initialize Pulumi stack for AWS only
  const stack = await LocalWorkspace.createOrSelectStack({
    stackName: response.stackName,
    projectName: response.projectName,
    program: async () => {},
  });

  await stack.setConfig("aws:region", { value: response.region });
  console.log("✅ Pulumi stack initialized!");
}

module.exports = { initProject };
