require("dotenv").config()

const jsforce = require("jsforce")
const config = require(appRoot + "/config")

const oauth2 = new jsforce.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.BASE_URL + config.routes.auth.callback
})

exports.getUrl = () => {
  return oauth2.getAuthorizationUrl()
}

exports.store = (req) => {

  console.log("Authorizing with Oauth2.")

  const sf_object = {
    type: "oauth2",
    opened: new Date(),
    rest: process.env.API_ENDPOINT,
    authCredentials: {
      oauth2: oauth2
    },
    authResponse: {}
  }

  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection(sf_object.authCredentials)

    conn.authorize(req.query.code, (error, userInfo) => {

      if (!error) {

        sf_object.authResponse = {
          accessToken: conn.accessToken,
          instanceUrl: conn.instanceUrl
        }

        resolve(sf_object)

      } else {

        console.error(err)
        reject(err)

      }

    })

  })

}
