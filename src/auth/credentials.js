require("dotenv").config()

const jsforce = require("jsforce")

exports.store = (req) => {

  console.log("Authorizing with Username and Password.")

  const sf_object = {
    type: "credentials",
    opened: new Date(),
    rest: process.env.API_ENDPOINT,
    authCredentials: {
      username: req.get("username"),
      password: req.get("password")
    },
    authResponse: {}
  }

  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection()

    conn.login(
      sf_object.authCredentials.username,
      sf_object.authCredentials.password)
      .then(() => {

        sf_object.authResponse = {
          accessToken: conn.accessToken,
          instanceUrl: conn.instanceUrl
        }

        resolve(sf_object)

      })

  })

}
