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

  const sf_object = {
    auth_type: req.body.source
  }

  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection({ oauth2: oauth2 })

    conn.authorize(req.query.code, (err, userInfo) => {

      if (!err) {

        sf_object.opened_date = new Date()

        sf_object.auth_response = {
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
