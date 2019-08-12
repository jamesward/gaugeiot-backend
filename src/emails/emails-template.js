const accountVerificationEmailTemplate = (token, firstName) => {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            box-sizing: border-box;
            margin: 0px;
          }
          .container {
            display: divc;
            max-width: 700px;
            margin: auto;
            padding: 20px 0px;
            align-items: center;
            border-radius: 3px;
            background-color: #ffffff;
            text-align: center;
            -webkit-box-shadow: 0px 0px 12px 0px rgba(141, 150, 171, 1);
            -moz-box-shadow: 0px 0px 12px 0px rgba(141, 150, 171, 1);
            box-shadow: 0px 0px 12px 0px rgba(141, 150, 171, 1);
          }
    
          .container h1 {
            margin: 10px 0;
          }
    
          .verify-button,
          .verify-button:link,
          .verify-button:visited {
            background-color: #353b48;
            color: white !important;
            text-decoration: none;
            border-radius: 3px;
            padding: 10px 20px;
            border: solid 1px transparent;
          }
    
          .verify-button:active,
          .verify-button:hover {
            color: #353b48;
            background-color: white !important;
            border: solid 1px #353b48;
            -webkit-box-shadow: 0px 3px 31px -13px rgba(0, 0, 0, 0.75);
            -moz-box-shadow: 0px 3px 31px -13px rgba(0, 0, 0, 0.75);
            box-shadow: 0px 3px 31px -13px rgba(0, 0, 0, 0.75);
          }
    
          @media only screen and (max-width: 375px) {
            .container {
              max-width: 90%;
            }
            .container h1 {
              font-size: 16px;
            }
            p {
              font-size: 12px;
            }
            .btn-container {
              padding: 10px 0;
            }
            .verify-button {
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hi ${firstName}, welcome to Gauge Iot !</h1>
          <p>To verify your account, please click in the button below!</p>
          <div class="btn-container">
            <a
              class="verify-button"
              href="http://localhost:3000/api/auth/verifyEmail?token=${token}"
              >👉 Confirme Email Address
            </a>
          </div>

          <p>This verification email will be valid for <b>1 day</b>!</p>
        </div>
      </body>
    </html>`;
};

module.exports = {
  accountVerificationEmailTemplate
};
