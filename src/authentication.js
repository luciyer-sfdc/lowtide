require("dotenv").config()

const jsforce = require("jsforce")
const config = require("./config.js")

const oauth2 = new jsforce.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.BASE_URL + config.routes.auth.callback
})

exports.getAuthUrl = () => {
  return oauth2.getAuthorizationUrl()
}

exports.getOauthObject = () => {
  return { oauth2: oauth2 }
}

exports.getConnection = (session) => {
  return new jsforce.Connection({
    accessToken: session.salesforce.authResponse.accessToken,
    instanceUrl: session.salesforce.authResponse.instanceUrl
  })
}

exports.storeInternal = async (req) => {

  console.log("Authorizing with Salesforce Session.")

  const sf_object = {
    type: "session",
    opened: new Date(),
    rest: process.env.API_ENDPOINT,
    authCredentials: {},
    authResponse: {}
  }

  sf_object.authCredentials = {
    serverUrl: req.get("server_url"),
    sessionId: req.get("session_id"),
    version: process.env.API_VERSION
  }

  let conn = new jsforce.Connection(sf_object.authCredentials)

  sf_object.authResponse = {
    accessToken: conn.accessToken,
    instanceUrl: conn.instanceUrl
  }

  return sf_object

}
