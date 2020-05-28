require("dotenv").config()

exports.store = (req) => {

  console.log("Authorizing with Salesforce Session.")

  const sf_object = {
    type: "session",
    opened: new Date(),
    rest: process.env.API_ENDPOINT,
    authCredentials: {
      serverUrl: req.get("server_url"),
      sessionId: req.get("session_id"),
      version: process.env.API_VERSION
    },
    authResponse: {}
  }

  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection(sf_object.authCredentials)

    sf_object.authResponse = {
      accessToken: conn.accessToken,
      instanceUrl: conn.instanceUrl
    }

    resolve(sf_object)

  })

}
