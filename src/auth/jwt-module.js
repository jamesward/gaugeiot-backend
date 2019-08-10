const fs = require('fs');
const _jwt = require('jsonwebtoken');
// http://travistidwell.com/blog/2013/09/06/an-online-rsa-public-and-private-key-generator/
// use 'utf8' to get string instead of byte array  (1024 bit key)
var privateKEY = fs.readFileSync('src/auth/private.key', 'utf8'); // to sign _jwt
var publicKEY = fs.readFileSync('src/auth/public.key', 'utf8'); // to verify _jwt

module.exports = {
  sign: (payload, expiresIn = '1d', $Options) => {
    /*
			sOptions = {
				issuer: "Authorizaxtion/Resource/This server",
				subject: "iam@user.me", 
				audience: "Client_Identity" // this should be provided by client
			}
		*/

    // Token signing options
    var signOptions = {
      issuer: 'Gauge Iot Server',
      subject: 'iam@user.me',
      audience: 'http://gaugeiot.com',
      expiresIn: expiresIn, //default 1day
      algorithm: 'RS256' // RSASSA options[ "RS256", "RS384", "RS512" ]
    };
    return _jwt.sign(payload, privateKEY, signOptions);
  },

  verify: (token, $Option) => {
    /*
			vOption = {
				issuer: "Authorization/Resource/This server",
				subject: "iam@user.me", 
				audience: "Client_Identity" // this should be provided by client
			}		
    */

    var verifyOptions = {
      issuer: 'Gauge Iot Server',
      subject: 'iam@user.me',
      audience: 'http://gaugeiot.com',
      expiresIn: '30d',
      algorithm: ['RS256']
    };
    try {
      if (_jwt.verify(token, publicKEY, verifyOptions)) return true;
    } catch (err) {
      return false;
    }
  },

  decode: token => {
    return _jwt.decode(token, { complete: true });
  },
  // get token from the Bearer field
  filterToken: headers => headers.authorization.split(' ')[1]
};
