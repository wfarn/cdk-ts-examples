import { SynthUtils } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import { EventType } from '@aws-cdk/aws-s3'
import { S3LambdaEvent } from '../lib/s3-lambda-event';

/*
 * Snapshot default test event
 */
var testBucket  = 'test-bucket'
var testHandler = 'test.handler'

test('to match the test s3 event snapshot', () => {
  const stack = new cdk.Stack();

  new S3LambdaEvent(stack, 'testS3LambdaEvent', {
    bucketName: `${testBucket}`,
    codePath: '../test/testFn'
  });

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('to be able to define the bucket name', () => {
  const stack = new cdk.Stack();

  new S3LambdaEvent(stack, 'testS3LambdaEvent', {
    bucketName: `${testBucket}`,
    codePath: '../test/testFn'
  });

  expect(stack).toHaveResource('AWS::S3::Bucket', {
    BucketName: `${testBucket}`
  });
});

test('that the default function handler is "index.handler"', () => {
  const stack = new cdk.Stack();

  new S3LambdaEvent(stack, 'testS3LambdaEvent', {
    bucketName: `${testBucket}`,
    codePath: '../test/testFn'
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Handler: 'index.handler'
  });
});

test('that it is possible to define the function handler', () => {
  const stack = new cdk.Stack();

  new S3LambdaEvent(stack, 'testS3LambdaEvent', {
    bucketName: `${testBucket}`,
    codePath: '../test/testFn',
    fnHandler: `${testHandler}`
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Handler: `${testHandler}`
  });
});

test('that the default event type is "OBJECT_CREATED"', () => {
  const stack = new cdk.Stack();

  new S3LambdaEvent(stack, 'testS3LambdaEvent', {
    bucketName: `${testBucket}`,
    codePath: '../test/testFn',
    fnHandler: `${testHandler}`,
  });

  expect(stack).toHaveResource('Custom::S3BucketNotifications', {
    NotificationConfiguration: {
      LambdaFunctionConfigurations: [
        {
          Events: [
            "s3:ObjectCreated:*",
          ],
          LambdaFunctionArn: {
            "Fn::GetAtt": [
              "testS3LambdaEvents3LambdaEventFunction959314A5",
              "Arn"
            ]
          }
        },
      ]}
    });
});

test('that it is possible to define the event type', () => {
  const stack = new cdk.Stack();

  new S3LambdaEvent(stack, 'testS3LambdaEvent', {
    bucketName: `${testBucket}`,
    codePath: '../test/testFn',
    fnHandler: `${testHandler}`,
    eventType: EventType.OBJECT_REMOVED
  });

  expect(stack).toHaveResource('Custom::S3BucketNotifications', {
    NotificationConfiguration: {
      LambdaFunctionConfigurations: [
        {
          Events: [
            "s3:ObjectRemoved:*",
          ],
          LambdaFunctionArn: {
            "Fn::GetAtt": [
              "testS3LambdaEvents3LambdaEventFunction959314A5",
              "Arn"
            ]
          }
        }
      ],
    }
  });
});