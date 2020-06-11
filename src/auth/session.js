require("dotenv").config()

const jsforce = require("jsforce")

exports.store = (req) => {

  const auth_credentials = {
    sessionId: req.body.credentials.session_id,
    serverUrl: req.body.credentials.server_url,
    version: process.env.API_VERSION
  }

  const sf_object = {
    auth_type: req.body.source
  }

  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection(auth_credentials)

    sf_object.opened_date = new Date()

    conn.identity((err, _) => {
      if (!err) {

        sf_object.auth_response = {
          accessToken: conn.accessToken,
          instanceUrl: conn.instanceUrl
        }

        resolve(sf_object)

      } else {
        reject("Could not authenticate with session information.")
      }
    })


  })

}
