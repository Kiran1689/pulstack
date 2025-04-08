# ⚡ Pulstack – Instant Static Site Deployment with Pulumi

`pulstack` is a developer-friendly tool that lets you deploy static websites to AWS (S3 + CloudFront) or GitHub Pages with zero configuraton. It uses [Pulumi](https://www.pulumi.com/) under the hood to treat infrastructure as code, so your deployments are fully automated and version-controlled.

<p align="center">
  <img src="https://img.shields.io/badge/built%20with-pulumi-purple?logo=pulumi" alt="Pulumi Badge">
  <img src="https://img.shields.io/badge/deploys%20to-aws-orange?logo=amazonaws" alt="AWS Badge">
  <img src="https://img.shields.io/badge/deploys%20to-github%20pages-blue?logo=github" alt="GitHub Pages Badge">
</p>

## 🧑‍💻 Who Is This For?

Pulstack is perfect if you:

- Have a static website (HTML/CSS/JS or React/Vite/Next.js build)
- Want to deploy to AWS (S3+CloudFront) or GitHub Pages in 1 command
- Don’t want to write YAML, CloudFormation, or Terraform
- Like simple CLI workflows with guided and simple prompts


## ✨ Features

- 🚀 Deploy static sites to AWS S3 with CloudFront CDN

- 🌍 Automatically create Repo and publish to GitHub Pages

- 🔒 Secure AWS deployments using best practices (no public buckets!)

- 💡 Clean CLI prompts to guide you through setup

- 🧨 One-command destroy of your whole stack when you're done

## 📦 Prerequisites
You only need to install the tools for the provider you want to use (AWS or GitHub). Here's a breakdown:

### 🔧 Required for All
#### 1.  Node.js
   ```bash
   node -v
   ```
#### 2. Pulumi
Install it from [https://www.pulumi.com/docs/install/](https://www.pulumi.com/docs/install/)

```bash
pulumi version
pulumi login
```
> [!IMPORTANT]
> You'll need to log in to Pulumi (Mandatory)

### 🌩️ If You Want to Deploy to AWS (S3 + CloudFront)


#### ✅ Install AWS CLI
(for S3/CloudFront deployments only, You can skip this if you want to deploy on GitHub)

```bash
aws --version
```

If not installed: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html


**Create IAM user in aws console with necessary permissions**
- `s3:*` – Create and manage buckets, upload files, set bucket policies.
- `cloudfront:*` – Create and configure CloudFront distributions.
- `iam:GetUser, iam:PassRole` – Required for linking CloudFront with S3 via OAI.
- `iam:CreateServiceLinkedRole` – Needed for enabling AWS services like CloudFront.
- `logs:*` – For any logging resources created by Pulumi or AWS services.
- `sts:GetCallerIdentity` – Used by Pulumi to identify the active IAM user.


**🔐 Configure AWS Credentials**
```bash
aws configure
```


**You'll need:**
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)


**Ensure credentials are valid:**
```bash
aws sts get-caller-identity
```

> [!NOTE]
> Make sure the IAM user has the necessary permissions.

### 🐙 If You Want to Deploy to GitHub Pages

#### 🔐 Create GitHub Token
(for GitHub Pages only, You can skip this if you want to deploy on AWS S3)

- Create a Personal Access Token(Classic) with `repo` and `delete_repo` permission enabled.

- Save this somewhere safe — you’ll need it during `init`.


## 🚀 Quick Start

### 📁 Project Structure
```
.
├── index.js              # Entry CLI to handle commands
├── deploy.js             # AWS S3 + CloudFront deployment logic
├── deployGithub.js       # GitHub Pages deployment logic with Pulumi
├── destroy.js            # Stack destroy logic
├── pulumiProgram.js      # Defines AWS infra using Pulumi
├── config.json           # User config file generated at init
├── public/               # Your static site directory (e.g. index.html, assets)
├── init.js               # The init logics
```

> 💡 This structure is generated or expected after running node index.js init.

### 1. Clone and Install
```bash
git clone https://github.com/Kiran1689/pulstack.git
cd pulstack
npm install
```

### 2. Initialize project

#### ▶️ For AWS:

```bash
node index.js init
```
Follow the prompts:

- Project name

- Description

- Stack name (e.g., dev)

- AWS region

- Option to auto-generate public/index.html to quick test Pulstack instantly — even without any files!

The `config.json` file will be created to store your inputs locally.

<img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fuc053c4bmbtu4d9oc0wp.png" alt="aws init">

#### ▶️ For GitHub Pages:

```bash
node index.js init --github
```

Follow prompts:

- GitHub repo name

- Stack name (e.g., dev)

- Build dir (e.g., ./build or ./public)

- GitHub token (with repo + delete permissions)

The `config.json` file will be created to store your inputs locally.

<img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F66zi4iuy3x1lte1dkh0k.png" alt="git init">

### 3. Deploy Your Site

#### 🚀Deploy to AWS:

```bash
node index.js deploy --target aws --dir ./public
# --dir ./public Points to your static site files. For React apps, use ./build
```

*What will happen after running this?*

```
📁 public/
   │
   └── node index.js deploy --target aws
             ↓
       Pulumi provisions:
       - ✅ S3 Bucket
       - ✅ Uploads static files
       - ✅ CloudFront CDN
             ↓
       🌐 S3 Bucket name
       🌐 Returns your site URL!
```

✅ On success, you'll see:

- AWS S3 bucket name

- Live CloudFront URL

> [!NOTE]
> You can replace ./public with your build folder (./build, ./dist, etc.)

<img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fko2w5sl7i7i2mdmx6o2f.png" alt="git init">

> [!NOTE]
> In AWS S3 console, the bucket name will be your project name

#### 🚀 Deploy to GitHub Pages:

```bash
node index.js deploy --target aws --dir ./public
```

*What will happen after running this?*

```
📁 public/
   │
   └── node index.js deploy --target github-pages
             ↓
       Pulumi provisions:
       - ✅ Creates a new repo
       - ✅ Pushes static content to gh-pages (using simple-git)
       - ✅ Enables GitHub Pages
             ↓
       🌐 Outputs a live site URL!
```

✅ On success, you'll see:

- GitHub Pages URL

<img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fxptqtbq5phlo4l9sz2ox.png" alt="git init">
  
> [!NOTE]
> You can replace ./public with your build folder (./build, ./dist, etc.)

#### 4. Destroy

To destroy the stack run:

```bash
node index.js destroy
```

> [!NOTE]
> The stack name and project name will be fetched from the config.json file

## 🛠 Built With
- [Pulumi](https://www.pulumi.com/)

- [AWS S3 + CloudFront](https://aws.amazon.com/)

- [GitHub Pages](https://pages.github.com/)

- [Node.js](https://nodejs.org/en)

- [simple-git](https://www.npmjs.com/package/simple-git)


## 🙌 Credits
Inspired by the power of Pulumi and the simplicity of static hosting.
Feel free to fork, extend, and customize!

## 🤝 Contributing
Contributions, issues and feature requests are welcome!
Feel free to check [issues page](../../issues).

## 💬 Need Help?
Open an issue or start a discussion. Let's build better deployments together with pulumi.


## 🪪 License
This project is licensed under the [MIT License](./LICENSE).

    
