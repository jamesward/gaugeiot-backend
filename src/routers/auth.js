const express = require('express');
const router = express.Router();
const AWS = require('../database/db');
const { sendVerificationEmail } = require('../emails/email');
const jwt = require('../auth/jwt-module');

//This file has the routers related to the user account management

//TODO: REMOVE for production
router.post('/sendEmail', (req, res) => {
  sendVerificationEmail('hahaha');
  res.status(200).send('Email Sent');
});

// Authenticates registered user by giving them a JWT
router.post('/signin', (req, res) => {
  //TODO: remove log
  console.log('signin called');

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

router.get('/verify', (req, res) => {
  const token = jwt.filterToken(req.headers);
  const tokenVerified = jwt.verify(token);
  if (tokenVerified) return res.json({ verified: 'true' });
  else return res.json({ verified: 'false' });
});

// Create a new user account
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

  //DynamoDB parameters
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
        res.status(400).json({
          code: responseCodes.emailRegVer,
          msg: 'User is already registered and verified!'
        });
      else {
        // user is registered but his account was not verified
        res.status(400).json({
          code: responseCodes.emailReg,
          msg: 'User is registered but not verified!'
        });
      }
    } else {
      // If we reach here, it means the user does not exist yet
      // Generate a token to be used in the verification of the user
      // account email
      let accountVerificationToken = jwt.sign({ email, name }, '1d');
      let passwordResetToken = 'none';
      params = {
        TableName,
        Item: {
          email,
          name,
          firstName,
          lastName,
          password,
          isVerified: false,
          passwordResetToken,
          accountVerificationToken
        }
      };
      // Insert the new user into database
      docClient.put(params, function(err, data) {
        if (err) {
          res.status(500).json({ code: 500, msg: 'Internal server error!' });
        } else {
          res.status(200).json({
            code: responseCodes.emailNew,
            msg: 'User account created!'
          });
          // Send a email to the user with an account verification token
          sendVerificationEmail(accountVerificationToken, firstName, email);
        }
      });
    }
  });
});

// Does the email account verification
router.get('/verifyEmail', function(req, res) {
  // Get token from the GET request
  let token = req.query.token;

  // Make sure token is still valid
  let tokenVerified = jwt.verify(token);

  // Checks if token is valid
  if (!tokenVerified) {
    // TODOD: If token is not valid anymore, we should send a html page
    // inform an error occurred in the account validation and ask
    // if we should provided a new valitation token by email.
    res.status(400).json({ msg: 'Token is not valid anymore!' });
  } else {
    // If we reach here, it means we got a valid token :)

    // Decode the token to be able to access its payload
    let tokenDecoded = jwt.decode(token);

    //Get user email and name from the token
    let email = tokenDecoded.payload.email;
    let name = tokenDecoded.payload.name;

    // Check if this account axist in database
    let TableName = 'users';
    let params = {
      TableName,
      Key: {
        email,
        name
      }
    };

    // Creates a DynamoDB database client
    const docClient = new AWS.DynamoDB.DocumentClient();
    docClient.get(params, (err, data) => {
      if (err) {
        // TODO: send a html page to indicates an Internal server error occured
        res.status(500).json({ code: 500, msg: 'Internal server error!' });
      } else if (data.Item === undefined) {
        // If we reach here, it means the user account associated with the email
        // provided in the token does not exist.
        // TODO: Send a html page to inform the user with this email is not registered
        // in our database
        res.status(400).json({
          code: 400,
          msg: `A user with name ${name} and email ${email} does not have a registered account!`
        });
      } else if (data.Item.isVerified === true) {
        // If we reach here, it means the user is already revified
        // TODO: send a html page to the user to inform the user account was sucessfull
        // veirfied, and give the option to the user to go to be login page.
        res.status(200).send('Account alredy verified!');
      } else {
        // If we reach here, it means the user account associated with the email
        // provided in the token exist in our database and the account isn't verified,
        // so we can mark the account as verified in our database.

        //Setup database parameters to set the user account as verified
        params = {
          TableName,
          Key: {
            email,
            name
          },
          UpdateExpression: 'set isVerified = :v',
          ExpressionAttributeValues: {
            ':v': true
          },
          ReturnValues: 'UPDATED_NEW'
        };
        // Set the user account as verified in database
        docClient.update(params, (err, data) => {
          if (err) {
            // TODO: send a html page to indicates an Internal server error occured
            res.status(500).json({ code: 500, msg: 'Internal server error!' });
          } else {
            //TODO: send a html page to the user to informe the user account was sucessfull
            // verified, and give the option to the user to go to be login page.
            res.status(200).send('Email verified!');
          }
        });
      }
    });
  }
});

module.exports = router;
