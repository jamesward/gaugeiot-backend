const AWS = require('aws-sdk');

// TODO: Put accessKeyId and secretAccessKey as enviroment varaibles !!!!!

AWS.config.update({
  region: 'us-west-2',
  endpoint: 'http://dynamodb.us-west-2.amazonaws.com',
  accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID,
  secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY
});

// const { Firestore } = require("@google-cloud/firestore");

// // Create a new database connection
// const db = new Firestore({ keyFilename: process.env.GOOGLE_APPSPOT });

module.exports = AWS;
