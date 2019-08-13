const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const AWS = require('../database/db');
const { sendVerificationEmail } = require('../emails/email');
const jwt = require('../auth/jwt-module');

//This file has the routers related to the user account management

// Salt used by bcrypt to hash user passwords
const saltRounds = 10;

//TODO: REMOVE for production
router.post('/sendEmail', (req, res) => {
  sendVerificationEmail('hahaha');
  res.status(200).send('Email Sent');
});

//TODO: REMOVE for production
router.post('/checkPassword', (req, res) => {
  sendVerificationEmail('Checking password!');
  const plainTextPassword = req.body.password;
  // Load hash from your password DB.
  let hash = '$2b$10$1z3g3lh8bMwcH7uZbMPFY.C3phsDoAiZP67UwYLRsLtb6IncOUC.C';
  let hash2 = '$2b$10$M7YvPaUjnEoLNzo4XpRqruXbmRP8ITbIwSktruvYUFjTqtE2nEnaW';
  bcrypt.compare(plainTextPassword, hash2, function(err, response) {
    if (err) res.status(500).json({ code: 500, msg: 'Internal server error!' });
    if (response === true) res.status(200).send('Password OK');
    else res.status(400).send('Password NOT OK');
  });
});

// Authenticates registered user by giving them a JWT
router.post('/signin', (req, res) => {
  //TODO: remove log
  console.log('signin called');

  const responseCodes = {
    wrongInputs: 0, // userMail or userPassword are empty or invalid
    accountDoesNotExist: 1, // account does not exist in database
    accountNotVerified: 2, // Account exist but email wasn't verified
    passwordMismatch: 3, // password doesn't match the database password,
    tokenProvided: 4 // user signin successfully and a token was provided
  };
  // Get user email and password from the resquest body
  const email = req.body.email;
  const plainTextPassword = req.body.password;

  //check for valitations errors
  if (!email || !plainTextPassword) {
    res
      .status(400)
      .json({
        code: responseCodes.wrongInputs,
        msg: 'One or more fields is/are empty!'
      });
    return;
  }

  //DynamoDB parameters
  const TableName = 'users';
  let params = {
    TableName,
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };
  const docClient = new AWS.DynamoDB.DocumentClient();
  // try to find an account associated with the provided email in database
  docClient.query(params, function(err, data) {
    if (err) {
      console.log(err);

      res.status(500).json({ code: 500, msg: 'Internal server error!' });
      return;
    }
    // Checks if account exist
    if (data.Count === 0) {
      res
        .status(400)
        .json({
          code: responseCodes.accountDoesNotExist,
          msg: `Account doesn't exist !`
        });
      return;
    }
    // Check if email was verified. Only accounts with verified email can signin
    if (data.Items[0].isVerified === false) {
      res
        .status(400)
        .json({
          code: responseCodes.accountNotVerified,
          msg: `Account exist but email wasn't verified !`
        });
      return;
    }
    //check if the password provided match with the one stored in database
    const storedPassword = data.Items[0].password;
    bcrypt.compare(plainTextPassword, storedPassword, (err, response) => {
      if (err) {
        res.status(500).json({ code: 500, msg: 'Internal server error!' });
        return;
      }
      // if password doesn't match report error to the caller
      if (!response) {
        res
          .status(400)
          .json({
            code: responseCodes.passwordMismatch,
            msg: `Password doesn't match the password stored in database !`
          });
        return;
      }
      // if passwords matchs, a token should be provided to the user
      const token = jwt.sign({ email });
      res.status(200).json({ code: responseCodes.tokenProvided, msg: token });
    });
  });
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
  const plainTextPassword = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const name = `${firstName} ${lastName}`;

  //check for valitations errors
  if (!email || !plainTextPassword || !firstName || !lastName)
    res.status(400).json({ msg: 'One or more fields is/are empty!' });

  const responseCodes = {
    emailReg: 0, // email already registere but not verified
    emailRegVer: 1, // email registered and verified
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

      // Initially there is no token to reset password
      let passwordResetToken = 'none';

      // Generates a hashed password based in the plain text password provided
      // by the the user
      bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {
          res.status(500).json({ code: 500, msg: 'Internal server error!' });
        }
        // Generates the hash password based in the plainTextPassword and the salt
        bcrypt.hash(plainTextPassword, salt, function(err, hash) {
          if (err) {
            res.status(500).json({ code: 500, msg: 'Internal server error!' });
          }

          const password = hash;
          //DynamoDB parameters
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
              res
                .status(500)
                .json({ code: 500, msg: 'Internal server error!' });
            } else {
              res.status(200).json({
                code: responseCodes.emailNew,
                msg: 'User account created!'
              });
              // Send a email to the user with an account verification token
              sendVerificationEmail(accountVerificationToken, firstName, email);
            }
          });
        });
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
