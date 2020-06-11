const jsforce = require("jsforce")

const config = require(appRoot + "/config")

const foundConnection = (session) => {
  return (
    session.salesforce &&
    session.salesforce.authResponse !== {} &&
    session.salesforce.authResponse !== undefined
  )
}

const isAuthenticating = (req) => {
  return (
    req.path === config.routes.auth.request ||
    req.path === config.routes.auth.callback ||
    req.path === config.routes.auth.revoke
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
  isAuthenticating: isAuthenticating,
  getStoredConnection: getStoredConnection,
  oauth2: require("./oauth2"),
  session: require("./session"),
  credentials: require("./credentials"),
  testing: require("./test_connection")
}
