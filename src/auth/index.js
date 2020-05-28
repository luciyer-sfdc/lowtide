const jsforce = require("jsforce")

const getStoredConnection = (session) => {
  return new jsforce.Connection({
    accessToken: session.salesforce.authResponse.accessToken,
    instanceUrl: session.salesforce.authResponse.instanceUrl
  })
}

module.exports = {
  getStoredConnection: getStoredConnection,
  testing: require("./test_connection"),
  session: require("./session"),
  oauth2: require("./oauth2")
}
