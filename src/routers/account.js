const express = require('express');
const router = express.Router();
const AWS = require('../database/db');

//This file has the routers related to the user account management

// define the home page route
router.get('/', function(req, res) {
  res.send('Accounts Home Page');
});

// create a new user account
router.post('/signup', function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const name = `${firstName} ${lastName}`;

  //check for valitations errors
  if (!email || !password || !firstName || !lastName)
    res.status(400).json({ msg: 'One or more fields is/are empty!' });

  const responseCodes = {
    emailReg: 0, // email already registere but not verified
    emailRegVer: 1, //email registered and verified
    emailNew: 2 // new email, registered right now
  };

  const docClient = new AWS.DynamoDB.DocumentClient();
  const TableName = 'users';

  let params = {
    TableName,
    Key: {
      email,
      name
    }
  };

  //make sure this account doesn't already exist
  docClient.get(params, function(err, data) {
    if (err) res.status(500).json({ code: 500, msg: 'Internal server error!' });
    else if (data.Item !== undefined) {
      // user is registered and verified
      if (data.Item.isVerified)
        res
          .status(400)
          .json({
            code: responseCodes.emailRegVer,
            msg: 'User is already registered and verified!'
          });
      else {
        // user is registered but his account was not verified
        res
          .status(500)
          .json({
            code: responseCodes.emailReg,
            msg: 'User is registered but not verified!'
          });
      }
    } else {
      //user does not exist yet
      params = {
        TableName,
        Item: {
          email,
          name,
          firstName,
          lastName,
          password,
          isVerified: false,
          passwordResetToken: 'none'
        }
      };
      docClient.put(params, function(err, data) {
        if (err) {
          res.status(500).json({ code: 500, msg: 'Internal server error!' });
        } else {
          res
            .status(200)
            .json({
              code: responseCodes.emailNew,
              msg: 'User account created!'
            });
          //TODO: Send a email to the user with an account verification token
        }
      });
    }
  });
});

module.exports = router;
