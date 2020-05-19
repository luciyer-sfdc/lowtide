require("dotenv").config()

const { v4: uuidv4 } = require("uuid")
const shortid = require("shortid")
const jsforce = require("jsforce")
const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const bodyparser = require("body-parser")
const middleware = require('express-async-handler')

const lowtide = require("./src"),
      auth = lowtide.auth,
      util = lowtide.util,
      config = lowtide.config,
      package = lowtide.package,
      repository = lowtide.repository,
      deploy = lowtide.deploy

const mongo_connection = process.env.MONGODB_URI || "mongodb://localhost/";

const app = express()

app
  .use(bodyparser.json())
  .use(express.urlencoded({ extended: true }))
  .use(session({
    genid: (req) => {
      return uuidv4()
    },
    secret: "some secret here stored in process.env",
    cookie: { maxAge: (60 * 60 * 1000) },
    store: new MongoStore({
      url: mongo_connection
    }),
    resave: false,
    saveUninitialized: true
  }))

app.use(function (req, res, next) {

  if ( (!req.session.salesforce || req.session.salesforce.authResponse === undefined) &&
      req.path !== config.routes.auth.callback) {

    console.log("No Salesforce session. Initializing...")

    req.session.salesforce = {}

    try {

      if (req.get("source") === "session") {

        auth.storeInternal(req)
          .then(sfdc => {
            console.log("Routing request.")
            req.session.salesforce = sfdc
            next()
          })
          .catch(error => {
            console.error(error)
          })

      } else {
        console.log("Routing to Salesforce Oauth URL.")
        res.redirect(auth.getAuthUrl())
      }

    } catch (err) {
      console.error(err)
    }

  } else {
    console.log("Salesforce found on session:", req.sessionID)
    console.log("SF Details:", req.session.salesforce.authResponse)
    console.log("Cookie:", req.session.cookie)
    console.log("Routing request.")
    next()
  }

})

app
  .listen(process.env.PORT || 8080, () => {
    console.log("Server Up.")
  })


app.get(config.routes.auth.callback, middleware(async(req, res, next) => {

  console.log("Authorizing with Oauth2.")

  const sf_object = {
    type: "oauth2",
    opened: new Date(),
    rest: process.env.API_ENDPOINT,
    authCredentials: {},
    authResponse: {}
  }

  sf_object.authCredentials = auth.getOauthObject()

  let conn = new jsforce.Connection(sf_object.authCredentials)

  conn.authorize(req.query.code, (err, userInfo) => {

    if (!err) {

      sf_object.authResponse = {
        accessToken: conn.accessToken,
        instanceUrl: conn.instanceUrl
      }

      req.session.salesforce = sf_object

      console.log("Redirecting to Homepage.")
      res.redirect("/")

    } else {
      console.error(err)
      res.status(500).json({ error: err })
    }

  })

}))


app.all(config.routes.all, (req, res, next) => {
  console.log(`[${util.timestamp()}] ${req.method}: ${req.originalUrl}`)
  next()
})


app.get("/", (req, res) => {
  res.status(200).json({
    message: "Authentication Successful.",
    sessionId: req.sessionID
  })
})


app.get(config.routes.auth.revoke, (req, res) => {

  const conn = auth.getConnection(req.session)

  if (req.session.salesforce.type === "oauth2") {
    conn.logoutByOAuth2(() => {
      req.session.destroy(() => {
        res.status(200).json({ message: "Logout via oauth2 successful." })
      })
    })
  } else if (req.session.salesforce.type === "session") {
    conn.logout(() => {
      req.session.destroy(() => {
        res.status(200).json({ message: "Logout via oauth2 successful." })
      })
    })
  }

})
