const jsforce = require("jsforce")

const config = require(appRoot + "/config")

const oauth = require("./oauth"),
      session = require("./session"),
      credentials = require("./credentials"),
      getVersion = require("./api_version");

const VERBOSE = false

const logConnectionFound = (req) => {
  console.log("Salesforce found on session:", req.sessionID)
  if (VERBOSE) {
    console.log("Salesforce Auth:", req.session.salesforce.auth_response)
    console.log("Cookie:", req.session.cookie)
  }
}

const logNoConnectionFound = () => {
  console.log("No Salesforce session found. Initializing...")
}

const isAuthEndpoint = (req) => {
  return (
    req.path === config.ltApi("auth_request") ||
    req.path === config.ltApi("auth_callback") ||
    req.path === config.ltApi("auth_revoke")
  )
}

const foundConnection = (req) => {

  const hasConnection = (
    req.session.salesforce &&
    req.session.salesforce.auth_response !== {} &&
    req.session.salesforce.auth_response !== undefined
  )

  hasConnection
    ? logConnectionFound(req)
    : logNoConnectionFound();

  return hasConnection

}

const refreshConnection = (session) => {
  return new jsforce.Connection(session.salesforce.auth_response)
}

const handleAuthRequired = (req, res, next) => {
  if (!isAuthEndpoint(req) && !foundConnection(req))
    return res.status(500).json({
      message: "Not authenticated with Salesforce. First use /api/auth."
    })
  next()
}

const visitedAuth = (req, res) => {
  console.log("Authorizing with Oauth2. Redirecting.")
  res.redirect(oauth.getUrl())
}


const routeRequest = (req, res) => {

  if (foundConnection(req))
    return res.status(200).json({
      message: `Already authenticated with ${req.session.salesforce.auth_response.instanceUrl}. Use /api/auth/revoke to destroy current session.`
    })

  if (req.body.source === "session") {

    console.log("Authorizing with Salesforce Session.")

    session.store(req)
      .then(sf => {
        req.session.salesforce = sf
        res.sendStatus(200)
      })
      .catch(err => {
        console.error(err)
        res.status(403).json({
          message: err
        })
      })

  } else if (req.body.source === "credentials") {

    console.log("Authorizing with Username and Password.")

    credentials.store(req)
      .then(sf => {
        req.session.salesforce = sf
        res.sendStatus(200)
      })
      .catch(err => {
        res.status(403).json({
          message: err
        })
      })

  } else {
    res.status(500).json({
      message: "Must set request source."
    })
  }

}

const handleOauthCallback = (req, res) => {

  oauth.store(req)
    .then(sf => {

      /*
      const callbackUrl = new URL(req.hostname, req.originalUrl)
      console.log("Redirecting to request origin:", callbackUrl)
      */
      
      req.session.salesforce = sf
      res.redirect("/")

    })
    .catch(error => {
      res.status(500).json(error)
    })

}

const destroyConnection = (req, res) => {

  if (!foundConnection(req))
    return res.status(500).json({
      message: "No Salesforce connection found."
    })

  const conn = refreshConnection(req.session)

  conn.logout((err) => {
    if (!err) {

      req.session.destroy(() => {
        res.status(200).json({ message: "Logout successful." })
      })

    } else {

      req.session.destroy(() => {
        res.status(200).json({
          error: err,
          message: "Local session destroyed."
        })
      })

    }
  })

}

const describeSession = (req, res) => {
  res.status(200).json({
    "session": req.session
  })
}


module.exports = {

  foundConnection: foundConnection,
  isAuthEndpoint: isAuthEndpoint,
  refreshConnection: refreshConnection,

  handleAuthRequired: handleAuthRequired,
  visitedAuth: visitedAuth,
  routeRequest: routeRequest,
  handleOauthCallback: handleOauthCallback,
  destroyConnection: destroyConnection,
  describeSession: describeSession,

  oauth: oauth,
  session: session,
  credentials: credentials

}
