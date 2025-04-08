// pulumiProgram.js
"use strict";

const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");
//const mime = require("mime");
const fs = require("fs");
const path = require("path");

function createPulumiProgram(staticDir) {
  return async () => {
    // Create a bucket and expose a website index document

    const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
    const bucketName = config.projectName;

    let siteBucket = new aws.s3.BucketV2(bucketName, {});

    let siteBucketWebsiteConfig = new aws.s3.BucketWebsiteConfigurationV2("s3-website-bucket-config", {
        bucket: siteBucket.id,
        indexDocument: {
            suffix: "index.html",
        },
    });

    new aws.s3.BucketPublicAccessBlock("public-access-block", {
        bucket: siteBucket.id,
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,

    });

    // Create CloudFront Origin Access Identity
    const oai = new aws.cloudfront.OriginAccessIdentity("pulumi-oai", {
        comment: `Access Identity for ${bucketName}`,
      });
    {/*
    // Upload files from the staticDir
    const files = fs.readdirSync(staticDir);
    for (const file of files) {
      const filePath = path.join(staticDir, file);
      const contentType = getMimeType(file);

      new aws.s3.BucketObject(file, {
        bucket: siteBucket,
        source: new pulumi.asset.FileAsset(filePath),
        contentType,
      });
    }
    */}
    const addFolderContents = (staticDir, prefix) => {
        for (let item of fs.readdirSync(staticDir)) {
          let filePath = path.join(staticDir, item);
          let isDir = fs.lstatSync(filePath).isDirectory();
      
          // This handles adding subfolders and their content
          if (isDir) {
            const newPrefix = prefix ? path.join(prefix, item) : item;
            addFolderContents(filePath, newPrefix);
            continue;
          }
      
          let itemPath = prefix ? path.join(prefix, item) : item;
          itemPath = itemPath.replace(/\\/g,'/');             // convert Windows paths to something S3 will recognize
      
          let object = new aws.s3.BucketObject(itemPath, {
            bucket: siteBucket.id,
            source: new pulumi.asset.FileAsset(filePath),     // use FileAsset to point to a file
            contentType: getMimeType(filePath), // set the MIME type of the file
          });
        }
    }
      
    addFolderContents(staticDir);
    
    // Attach bucket policy for OAI
    new aws.s3.BucketPolicy("pulumi-bucket-policy", {
        bucket: siteBucket.bucket,
        policy: pulumi.all([siteBucket.bucket, oai.iamArn]).apply(([bucket, iamArn]) =>
          JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: { AWS: iamArn },
                Action: "s3:GetObject",
                Resource: `arn:aws:s3:::${bucket}/*`,
              },
            ],
          })
        ),
      });
    {/*
      // Upload static files
      const uploadFiles = (dir, prefix = "") => {
        for (const item of fs.readdirSync(dir)) {
          const filePath = path.join(dir, item);
          const stat = fs.statSync(filePath);
  
          if (stat.isDirectory()) {
            uploadFiles(filePath, path.join(prefix, item));
          } else {
            const relativePath = path.join(prefix, item).replace(/\\/g, "/");
  
            new aws.s3.BucketObject(relativePath, {
              bucket: siteBucket.id,
              source: new pulumi.asset.FileAsset(filePath),
              contentType: getMimeType(filePath),
            });
          }
        }
      };
  
      uploadFiles(staticDir);
      */}
    
      // CloudFront Distribution
      const distribution = new aws.cloudfront.Distribution("pulumi-cdn", {
        enabled: true,
        defaultRootObject: "index.html",
        origins: [
          {
            originId: siteBucket.arn,
            domainName: siteBucket.bucketRegionalDomainName,
            s3OriginConfig: {
              originAccessIdentity: oai.cloudfrontAccessIdentityPath,
            },
          },
        ],
        defaultCacheBehavior: {
          targetOriginId: siteBucket.arn,
          viewerProtocolPolicy: "redirect-to-https",
          allowedMethods: ["GET", "HEAD"],
          cachedMethods: ["GET", "HEAD"],
          forwardedValues: {
            queryString: false,
            cookies: { forward: "none" },
          },
          compress: true,
        },
        priceClass: "PriceClass_100",
        restrictions: {
          geoRestriction: {
            restrictionType: "none",
          },
        },
        viewerCertificate: {
          cloudfrontDefaultCertificate: true,
        },
      });
  
      return {
        bucketName: siteBucket.bucket,
        cloudfrontUrl: distribution.domainName.apply((domain) => `https://${domain}`),
      };
  };
}
// Simple mime type guesser
function getMimeType(file) {
    if (file.endsWith(".html")) return "text/html";
    if (file.endsWith(".css")) return "text/css";
    if (file.endsWith(".js")) return "application/javascript";
    if (file.endsWith(".json")) return "application/json";
    if (file.endsWith(".png")) return "image/png";
    if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
    return "text/plain";
}


module.exports = { createPulumiProgram };
