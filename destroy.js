const fs = require("fs");
const path = require("path");
const { LocalWorkspace } = require("@pulumi/pulumi/automation");

async function destroy() {
  const configPath = path.resolve("config.json");

  if (!fs.existsSync(configPath)) {
    console.error("❌ Missing config.json – have you run ` init`?");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  //const token = process.env.PULUMI_ACCESS_TOKEN || config.pulumiAccessToken;
  const stackName = config.stackName;
  const projectName = config.projectName;

  console.log(`🧨 Destroying stack "${stackName}" from project "${projectName}"...`);

  const stack = await LocalWorkspace.selectStack({
    stackName,
    projectName,
    program: async () => {}, // noop
  });

  await stack.destroy({ onOutput: console.log });

  console.log(`✅ Stack "${stackName}" destroyed successfully.`);
}

module.exports = { destroy };