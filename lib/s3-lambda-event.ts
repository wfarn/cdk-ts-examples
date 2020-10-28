import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3n from '@aws-cdk/aws-s3-notifications';

import path = require('path');

export interface S3LambdaEventProps {
  /** Name of the bucket to attach the event to */
    readonly bucketName: string;
  /** Local path to Lambda code directory or zipfile */
    readonly codePath: string;
  /** Optional Lambda function handler (default: "index.handler") */
    readonly fnHandler?: string;
  /** Optional defines bucket event which triggers Lambda (default: "OBJECT_CREATED")*/
    readonly eventType?: s3.EventType;
}

export class S3LambdaEvent extends cdk.Construct {
  /** Execute a Lambda function in response to an event in an S3 bucket */
  constructor(scope: cdk.Construct, id: string, props: S3LambdaEventProps) {
    super(scope, id);

    // Define function handler if not defined
    let fnHandler =
      typeof props.fnHandler === 'undefined'
        ? 'index.hander'
        : props.fnHandler;

    // Define event type if not defined
    let eventType =
      typeof props.eventType === 'undefined'
        ? s3.EventType.OBJECT_CREATED
        : props.eventType;

    const bucket = new s3.Bucket(this, 's3LambdaEventBucket', {
      bucketName: props.bucketName
    })

    const fn = new lambda.Function(this, 's3LambdaEventFunction', {
      functionName: 's3LambdaEventFunction',
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: fnHandler,
      code: lambda.Code.fromAsset(
        path.join(__dirname, props.codePath)
      ),
    });

    bucket.addEventNotification(eventType, new s3n.LambdaDestination(fn))
  }
}
