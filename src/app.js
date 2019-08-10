require('dotenv').config();
const express = require('express');
const graphqlHTTP = require('express-graphql');
const bodyParser = require('body-parser');
const AWS = require('./database/db');
const jwt = require('./auth/jwt-module');
const { schema, root } = require('./graphql/schema');
var accountRouter = require('./routers/account');

const app = express();

// parse application/json
app.use(bodyParser.json());

//
app.use('/account', accountRouter);

// Authenticates registered user by giving them a JWT
app.post('/api/auth', (req, res) => {
  //TODO: Get user email and password from the resquest body
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  //TODO: Check if user is registered (remove fake authentication)
  if (
    userEmail === process.env.FAKE_USER_EMAIL &&
    userPassword === process.env.FAKE_USER_PASSWORD
  ) {
    // If user is registered send new token if user id and email in the data field
    let token = jwt.sign({
      userId: process.env.FAKE_USER_ID, //TODO: remove this fake userID
      email: userEmail
    });
    res.json({ msg: token });
  } else {
    res.json({ msg: 'user-not-registered' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const token = jwt.filterToken(req.headers);
  const tokenVerified = jwt.verify(token);
  if (tokenVerified) return res.json({ verified: 'true' });
  else return res.json({ verified: 'false' });
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);
