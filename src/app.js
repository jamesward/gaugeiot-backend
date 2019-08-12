require('dotenv').config();
const express = require('express');
const graphqlHTTP = require('express-graphql');
const bodyParser = require('body-parser');
const AWS = require('./database/db');
const jwt = require('./auth/jwt-module');
const { schema, root } = require('./graphql/schema');
var authRouter = require('./routers/auth');

const app = express();

// parse application/json
app.use(bodyParser.json());
// parse application/urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//
app.use('/api/auth', authRouter);

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
