// deploy.js
const { LocalWorkspace } = require("@pulumi/pulumi/automation");
const path = require("path");
const fs = require("fs");
const { createPulumiProgram } = require("./pulumiProgram");

async function deploy(staticDir) {
  if (!fs.existsSync(staticDir)) {
    console.error(`Directory "${staticDir}" does not exist.`);
    process.exit(1);
  }

  const configPath = path.resolve("config.json");
  
    if (!fs.existsSync(configPath)) {
      console.error("❌ Missing config.json – have you run `init`?");
      process.exit(1);
    }
  
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  
    //const token = process.env.PULUMI_ACCESS_TOKEN || config.pulumiAccessToken;
    const stackName = config.stackName;
    const projectName = config.projectName;

  console.log("⏳ Initializing Pulumi stack...");

  const stack = await LocalWorkspace.createOrSelectStack({
    stackName,
    projectName,
    program: createPulumiProgram(staticDir),
  });

  console.log("✅ Stack initialized");

  await stack.setConfig("aws:region", { value: config.region || "us-east-1" });

  console.log("🚀 Deploying to AWS...");
  const upRes = await stack.up();

  console.log("\n✅ Deployment complete!");
  console.log(`📦 Bucket Name: ${upRes.outputs.bucketName.value}`);
  console.log(`🌐 Site URL: ${upRes.outputs.cloudfrontUrl.value}`);
}

module.exports = { deploy };
