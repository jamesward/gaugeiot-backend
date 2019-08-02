require('dotenv').config();
const express = require('express');
const AWS = require('./database/db');

const app = express();

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);

var docClient = new AWS.DynamoDB.DocumentClient();

var docClient = new AWS.DynamoDB.DocumentClient();

var table = 'users';

var year = 2015;
var title = 'The Big New Movie';

var params = {
  TableName: table,
  Key: {
    // year: year,
    // title: title
    email: 'joseigorcfm@gmail.com',
    name: 'Jose Igor Clementino Ferreira Moreira'
  }
};

docClient.get(params, function(err, data) {
  if (err) {
    console.error(
      'Unable to read item. Error JSON:',
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log('GetItem succeeded:', JSON.stringify(data, null, 2));
  }
});

// var params = {
//   TableName: 'Movies',
//   KeySchema: [
//     { AttributeName: 'year', KeyType: 'HASH' }, //Partition key
//     { AttributeName: 'title', KeyType: 'RANGE' } //Sort key
//   ],
//   AttributeDefinitions: [
//     { AttributeName: 'year', AttributeType: 'N' },
//     { AttributeName: 'title', AttributeType: 'S' }
//   ],
//   ProvisionedThroughput: {
//     ReadCapacityUnits: 10,
//     WriteCapacityUnits: 10
//   }
// };

// db.createTable(params, function(err, data) {
//   if (err) {
//     console.error(
//       'Unable to create table. Error JSON:',
//       JSON.stringify(err, null, 2)
//     );
//   } else {
//     console.log(
//       'Created table. Table description JSON:',
//       JSON.stringify(data, null, 2)
//     );
//   }
// });
// console.log(db);

// console.log(docClient);
// let fetchOneByKey = function() {
//   var params = {
//     TableName: 'users',
//     Key: {
//       email: 'joseigorcfm@gmail.com'
//     }
//   };
//   db.get(params, function(err, data) {
//     if (err) {
//       console.log(
//         'users::fetchOneByKey::error - ' + JSON.stringify(err, null, 2)
//       );
//     } else {
//       console.log(
//         'users::fetchOneByKey::success - ' + JSON.stringify(data, null, 2)
//       );
//     }
//   });
// };

// fetchOneByKey();

// const writeDb = async () => {
//   //Obtain a document reference.
//   const document = db.doc("posts/intro-to-firestore-1");
//   // Enter new data into the document.
//   await document.set({
//     title: "Welcome to Firestore",
//     body: "Hello guy"
//   });
//   console.log("Entered new data into the document");
// };

// function listenForMessages(subscriptionName, timeout) {
//   // [START pubsub_subscriber_async_pull]
//   // [START pubsub_quickstart_subscriber]
//   // Imports the Google Cloud client library
//   const { PubSub } = require("@google-cloud/pubsub");

//   // Creates a client
//   const pubsub = new PubSub();

//   /**
//    * TODO(developer): Uncomment the following lines to run the sample.
//    */
//   // const subscriptionName = 'my-sub';
//   // const timeout = 60;

//   // References an existing subscription
//   const subscription = pubsub.subscription(subscriptionName);

//   // Create an event handler to handle messages
//   let messageCount = 0;
//   const messageHandler = message => {
//     console.log(`Received message ${message.id}:`);
//     console.log(`\tData: ${message.data}`);
//     console.log(`\tAttributes: ${message.attributes}`);
//     messageCount += 1;

//     // "Ack" (acknowledge receipt of) the message
//     message.ack();
//   };

//   // Listen for new messages until timeout is hit
//   subscription.on(`message`, messageHandler);

//   setTimeout(() => {
//     subscription.removeListener("message", messageHandler);
//     console.log(`${messageCount} message(s) received.`);
//   }, timeout * 1000);
//   // [END pubsub_subscriber_async_pull]
//   // [END pubsub_quickstart_subscriber]
// }

// listenForMessages("test", 10);
// writeDb();
