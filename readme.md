Cognito6.js
====
AWS Cognito API for javascript/ES6.

```js
let region = 'REGION';
let identityPoolId = 'IDENTITY_POOL_ID';

/* configure AWS credentials */
AWS.config.region = region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId
});
```
```js
let client = yield CognitoClient.create(identityPoolId);
let dataset = yield client.openDataset('DATASET_NAME');
let value = yield dataset.get('RECORD_NAME');

console.log(value);

yield dataset.synchronize();

console.log("Synchronized");
```

Requirements
----
* [aws-sdk-js](https://github.com/aws/aws-sdk-js)
* [aws-cognito-js](https://github.com/aws/amazon-cognito-js)

You may also need....
----
* [co](https://github.com/tj/co)