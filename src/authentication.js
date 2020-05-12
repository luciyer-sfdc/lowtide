require("dotenv").config()

const jsforce = require("jsforce")
const config = require("./config.js")

const oauth2 = new jsforce.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.BASE_URL + config.routes.auth.callback
})

exports.makeConnection = (salesforce_session) => {
  return new jsforce.Connection({
    accessToken: session.salesforce.authResponse.accessToken,
    instanceUrl: session.salesforce.authResponse.instanceUrl
  })
}

exports.storeResponse = (req, source) => {

  const sf_object = {
    type: source,
    opened: new Date(),
    rest: process.env.API_ENDPOINT,
    authCredentials: {},
    authResponse: {}
  }

  if (source === "session") {

    console.log("Authorizing with Salesforce Session.")

    sf_object.authCredentials = {
      serverUrl: req.get("server_url"),
      sessionId: req.get("session_id"),
      version: process.env.API_VERSION
    }

    console.log(sf_object.authCredentials)

    let conn = new jsforce.Connection(sf_object.authCredentials)

    sf_object.authResponse = {
      accessToken: conn.accessToken,
      instanceUrl: conn.instanceUrl
    }

    console.log(sf_object)

    return sf_object

  } else if (source === "oauth2") {

    console.log("Authorizing with Oauth2.")

    sf_object.authCredentials = {
      oauth2: oauth2
    }

    console.log(sf_object.authCredentials)

    let conn = new jsforce.Connection(sf_object.authCredentials)

    conn.authorize(req.query.code, (err, userInfo) => {

      if (!err) {

        sf_object.authResponse = {
          accessToken: conn.accessToken,
          instanceUrl: conn.instanceUrl
        }

        console.log(sf_object)

        return sf_object

      } else {
        console.error(err)
      }
    })

  } else {
    console.error("Supported auth methods: Session or Oauth2.")
    return null
  }



}
