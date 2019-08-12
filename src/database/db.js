const AWS = require('aws-sdk');

// TODO: Put accessKeyId and secretAccessKey as enviroment varaibles !!!!!

AWS.config.update({
  region: 'us-west-2',
  endpoint: 'http://dynamodb.us-west-2.amazonaws.com',
  accessKeyId: 'AKIAZFNYFEFV63QNJZYG',
  secretAccessKey: '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'
});

// const { Firestore } = require("@google-cloud/firestore");

// // Create a new database connection
// const db = new Firestore({ keyFilename: process.env.GOOGLE_APPSPOT });

module.exports = AWS;
