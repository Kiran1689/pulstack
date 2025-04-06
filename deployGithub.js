const fs = require("fs");
const path = require("path");
const { LocalWorkspace } = require("@pulumi/pulumi/automation");
const simpleGit = require("simple-git");
require("dotenv").config();

async function deployGithub() {
  const configPath = path.resolve("config.json");

  if (!fs.existsSync(configPath)) {
    console.error("❌ Missing config.json – please run `statik init` first.");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const { projectName, description, deployDir, stackName } = config;

  let enablePages = false;
  let fullName = "";
  let repoUrl = "";

  if (!fs.existsSync(deployDir)) {
    console.error(`❌ Deploy directory "${deployDir}" does not exist.`);
    process.exit(1);
  }

  const token = process.env.GITHUB_TOKEN || config.githubToken;
  if (!token) {
    console.error("❌ GitHub token not found. Please set GITHUB_TOKEN as an env variable.");
    process.exit(1);
  }

  const program = async () => {
    const github = require("@pulumi/github");

    const repo = new github.Repository(projectName, {
      name: projectName,
      description,
      visibility: "public",
      ...(enablePages && {
        pages: {
          source: {
            branch: "gh-pages",
            path: "/",
          },
        },
      }),
    });

    return {
      repoUrl: repo.htmlUrl,
      fullName: repo.fullName,
    };
  };

  const stack = await LocalWorkspace.createOrSelectStack({
    stackName,
    projectName,
    program,
  });

  await stack.setAllConfig({
    "github:token": { value: token, secret: true },
  });

  console.log("📦 Creating GitHub repo...");
  const result = await stack.up();
  fullName = result.outputs.fullName.value;
  repoUrl = result.outputs.repoUrl.value;
  console.log("✅ GitHub repo created:", repoUrl);

  // Step 2: Push static site to gh-pages
  console.log("📤 Pushing site content to `gh-pages` branch...");
  const git = simpleGit(deployDir);
  await git.init();
  await git.checkoutLocalBranch("gh-pages"); // ✅ Create gh-pages branch
  await git.add(".");
  await git.commit("Deploy to GitHub Pages from statik");

  const remotes = await git.getRemotes(true);
  if (remotes.find(r => r.name === "origin")) {
    await git.removeRemote("origin");
  }
  await git.addRemote("origin", `https://github.com/${fullName}`).catch(() => {});
  await git.push("origin", "gh-pages", ["--force"]);

  // Step 3: Enable GitHub Pages
  console.log("🌍 Enabling GitHub Pages...");
  enablePages = true;
  const updatedStack = await LocalWorkspace.createOrSelectStack({
    stackName,
    projectName,
    program,
  });
  
  await updatedStack.setAllConfig({
    "github:token": { value: token, secret: true },
  });
  
  await updatedStack.up(); // ✅ re-run with updated program
  

  const [owner, repoName] = fullName.split("/");
  const siteUrl = `https://${owner.toLowerCase()}.github.io/${repoName}/`;
  console.log(`🎉 GitHub Pages deployed at: ${siteUrl}`);
}

module.exports = { deployGithub };
