const accountVerificationEmailTemplate = (token, firstName) => {
  return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            .body {
              box-sizing: border-box;
              padding: 3rem;
            }
            .container {
              display: flex;
              max-width: 700px;
              justify-content: center;
              flex-direction: column;
              margin: auto;
              padding: 20px 0px;
              align-items: center;
              border-radius: 3px;
              background-color: #8d96ab;
            }

            .container h1 {
              margin: 10px 0;
            }
            .verify-button {
              background-color: #353b48;
              color: white;
              text-decoration: none;
              border-radius: 3px;
              padding: 10px 20px;
              border: solid 1px transparent;
            }

            .verify-button:active,
            .verify-button:hover {
              color: #353b48;
              background-color: white;
              border: solid 1px #353b48;
              -webkit-box-shadow: 0px 3px 31px -13px rgba(0, 0, 0, 0.75);
              -moz-box-shadow: 0px 3px 31px -13px rgba(0, 0, 0, 0.75);
              box-shadow: 0px 3px 31px -13px rgba(0, 0, 0, 0.75);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1> Hi ${firstName}, welcome to Gauge Iot !</h1>
            <p>To verify your account, please click in the button below!</p>
            <a
              class="verify-button"
              href="http://localhost:3000/api/auth/verifyEmail?token=${token}"
              >👉 Click here!
            </a>
            <p>This verification email will be valid for <b>1 day</b>!</p>
          </div>
        </body>
      </html>`;
};

module.exports = {
  accountVerificationEmailTemplate
};
