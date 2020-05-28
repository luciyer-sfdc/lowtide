const jsforce = require("jsforce")

const config = require(appRoot + "/config")

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

const isAuthenticating = (req) => {
  return (
    req.path === config.routes.auth.request ||
    req.path === config.routes.auth.callback ||
    req.path === config.routes.auth.revoke
  )
}

module.exports = {
  foundConnection: foundConnection,
  getStoredConnection: getStoredConnection,
  oauth2: require("./oauth2"),
  session: require("./session"),
  testing: require("./test_connection")
}
