const { Firestore } = require("@google-cloud/firestore");

// Create a new database connection
const db = new Firestore({ keyFilename: process.env.GOOGLE_APPSPOT });

module.exports = db;
