require("dotenv").config()

const jsforce = require("jsforce")
const getVersion = require("./api_version")

exports.store = (req) => {

  const username = req.body.credentials.username,
        password = req.body.credentials.password;

  const sf_object = {
    auth_type: req.body.source
  }

  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection()

    conn.login(username, password, async (err, userInfo) => {

      if (!err) {

        const relatedUser = await conn
          .sobject("User")
          .retrieve(userInfo.id)

        sf_object.opened_date = new Date()
        sf_object.api = await getVersion(conn)

        sf_object.auth_response = {
          id: userInfo.id,
          name: relatedUser.Name,
          username: relatedUser.Username,
          accessToken: conn.accessToken,
          instanceUrl: conn.instanceUrl
        }

        resolve(sf_object)

      } else {

        console.error(err)
        reject("Invalid username, password, security token; or user locked out.")

      }

    })


  })

}
