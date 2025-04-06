#!/usr/bin/env node
const { Command } = require("commander");
const { deploy } = require("./deploy");
const { destroy } = require("./destroy");
const { initProject } = require("./init");
const { deployGithub  } = require("./deployGithub");
const program = new Command();

program
  .name("pulstack")
  .description("Deploy static site to AWS S3  or GitHub using Pulumi instantly")
  .version("0.1.0");

  program
  .command("deploy")
  .description("Deploy static site to AWS or GitHub Pages")
  .requiredOption("-d, --dir <path>", "Path to static site files")
  .option("-e, --env <name>", "Environment/stack name", "dev")
  .option("-t, --target <provider>", "Target platform: aws | github-pages", "aws")
  .action(async (opts) => {
    const target = opts.target;

    if (target === "github-pages") {
      await deployGithub(opts.dir);
    } else if (target === "aws") {
      await deploy(opts.dir, opts.env);
    } else {
      console.error(`❌ Unsupported target: ${target}`);
      process.exit(1);
    }
  });

program
.command("init")
.description("Initialize project and config")
.option("--github", "Initialize for GitHub Pages")
.action(async (opts) => {
await initProject({ github: opts.github });
});

program
.command("destroy")
.description("Destroy project")
.action(async () => {
await destroy();
});

program.parse();
