## ⚡ pulstack – Instant Static Site Deployment with Pulumi

`pulstack` is a developer-friendly tool that lets you deploy static websites to AWS (S3 + CloudFront) or GitHub Pages with zero configuraton. It uses [Pulumi](https://www.pulumi.com/) under the hood to treat infrastructure as code, so your deployments are fully automated and version-controlled.

### ✨ Features

- 🚀 Deploy static sites to AWS S3 with CloudFront CDN

- 🌍 Automatically create and publish to GitHub Pages

- 🔒 Secure AWS deployments using best practices (no public buckets!)

- 💡 Clean CLI prompts to guide you through setup

- 🧨 One-command destroy of your whole stack when you're done

### 📦 Prerequisites
Before using pulstack, make sure you have the following installed and configured:
1.  Node.js
   ```bash
   node -v
   ```
2. Pulumi
Install it from [https://www.pulumi.com/docs/install/](https://www.pulumi.com/docs/install/)

```bash
pulumi version
pulumi login
```
> You'll need to log in to Pulumi

3. AWS CLI (for S3/CloudFront deployments)
Install and configure your credentials:
```bash
aws configure
```

You'll need:

- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)

Ensure credentials are valid:
```bash
aws sts get-caller-identity
```

Make sure the IAM user has the necessary permissions

- `s3:*` – Create and manage buckets, upload files, set bucket policies.
- `cloudfront:*` – Create and configure CloudFront distributions.
- `iam:GetUser, iam:PassRole` – Required for linking CloudFront with S3 via OAI.
- `iam:CreateServiceLinkedRole` – Needed for enabling AWS services like CloudFront.
- `logs:*` – For any logging resources created by Pulumi or AWS services.
- `sts:GetCallerIdentity` – Used by Pulumi to identify the active IAM user.

4. GitHub Token (for GitHub Pages)
Create a Personal Access Token with `repo` and `delete` permission enabled.

## 🚀 Quick Start

1. Install dependencies
```bash
npm install
```

2. Initialize project

- If you want to deploy your site on AWS S3:
  ```bash
  node index.js init
  ```
  Follow the prompts on CLI and provide Project name, stack name, region and optionally create a public folder with sample index.html file if you want to test instantly ot dont have the build files.

- If you want to deploy your site on GitHub:
  ```bash
  node index.js init --github
  ```
  Follow the prompts on CLI and provide Repo name, stack name, GitHub Personal Access Token

3. Deploy

   - If you want to deploy your site on AWS S3:
    ```bash
    node index.js deploy --target aws --dir ./public
    ```
    After running this command you will get your live site URL.
    In AWS S3 console, the bucket name will be your project name

    - If you want to deploy your site on GitHub:
    ```bash
    node index.js deploy --target github-pages --dir ./public
    ```
    After running this command you will get your live site URL.
> [!NOTE]
> You can change the `directory name` according to your project. e.g If react project, pass `./build` folder

4. Destroy
To destroy the stack run:
```bash
node index.js destroy
```

## 🛠 Built With
- [Pulumi](https://www.pulumi.com/)

- [AWS S3 + CloudFront](https://aws.amazon.com/)

- [GitHub Pages](https://pages.github.com/)

- [Node.js](https://nodejs.org/en)

- [simple-git](https://www.npmjs.com/package/simple-git)


## 🙌 Credits
Inspired by the power of Pulumi and the simplicity of static hosting.
Feel free to fork, extend, and customize!
    
