const jsforce = require("jsforce")

const foundConnection = (session) => {
  return (
    session.salesforce &&
    session.salesforce.authResponse !== {} &&
    session.salesforce.authResponse !== undefined
  )
}

const getStoredConnection = (session) => {
  return new jsforce.Connection({
    accessToken: session.salesforce.authResponse.accessToken,
    instanceUrl: session.salesforce.authResponse.instanceUrl
  })
}

module.exports = {
  foundConnection: foundConnection,
  getStoredConnection: getStoredConnection,
  oauth2: require("./oauth2"),
  session: require("./session"),
  testing: require("./test_connection")
}
