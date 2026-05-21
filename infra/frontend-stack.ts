#!/usr/bin/env node
// CDK stack: S3 + CloudFront for the React frontend
// Free tier: S3 (5GB), CloudFront (1TB/month transfer, 10M requests)
//
// Deploy:
//   npm install -g aws-cdk
//   npm install
//   cdk bootstrap
//   cdk deploy

import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class NouriqFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── S3 bucket (private, served only via CloudFront) ──────────────────────
    const bucket = new s3.Bucket(this, 'NouriqFrontendBucket', {
      bucketName:    `nouriq-frontend-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: false,
    });

    // ── CloudFront OAC ───────────────────────────────────────────────────────
    const oac = new cloudfront.CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name:                          'NouriqOAC',
        originAccessControlOriginType: 's3',
        signingBehavior:               'always',
        signingProtocol:               'sigv4',
      },
    });

    // ── CloudFront distribution ──────────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, 'NouriqDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: 'index.html',
      // SPA fallback — serve index.html for all 404s (React Router)
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US/EU only — cheapest
    });

    // Attach OAC to distribution
    const cfnDist = distribution.node.defaultChild as cloudfront.CfnDistribution;
    cfnDist.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', oac.getAtt('Id'));
    cfnDist.addPropertyOverride('DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', '');

    // Allow CloudFront to read from S3
    bucket.addToResourcePolicy(new cdk.aws_iam.PolicyStatement({
      actions:   ['s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
      principals: [new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
      conditions: {
        StringEquals: { 'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}` },
      },
    }));

    // ── Deploy built frontend to S3 ──────────────────────────────────────────
    new s3deploy.BucketDeployment(this, 'NouriqDeploy', {
      sources: [s3deploy.Source.asset('../frontend/dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],  // Invalidate CloudFront on deploy
      prune: true,
    });

    // ── Outputs ──────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'BucketName',       { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'CloudFrontId',     { value: distribution.distributionId });
  }
}

const app = new cdk.App();
new NouriqFrontendStack(app, 'NouriqFrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region:  process.env.CDK_DEFAULT_REGION || 'ap-south-1', // Mumbai — closest to Bangalore
  },
});
