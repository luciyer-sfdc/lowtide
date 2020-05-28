require("dotenv").config()

const path = require("path")
const jsforce = require("jsforce")

global.appRoot = path.resolve(__dirname)

const express = require("express")
const session = require("express-session")
const bodyparser = require("body-parser")
const { v4: uuidv4 } = require("uuid")

const mongoose = require("mongoose")
const MongoStore = require("connect-mongo")(session)

const config = require("./config")
const auth = require("./src/auth")

const lowtide = require("./src"),
      util = lowtide.util,
      package = lowtide.package,
      repository = lowtide.repository,
      deploy = lowtide.deploy

const timeshift = require("./src/timeshift")

const template_list = util.listTemplates();

const db_uri = process.env.MONGODB_URI || "mongodb://localhost/dev"

mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => { console.log("Connected to MongoDB.") })
  .catch(console.error)

const app = express()

app
  .use(bodyparser.json())
  .use(express.urlencoded({ extended: true }))
  .use(session({
    genid: (req) => { return uuidv4() },
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: (60 * 60 * 1000) },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: true
  }))

app
  .listen(process.env.PORT || 8080, () => {
    console.log("Server Up.")
  })

app.all(config.routes.all, (req, res, next) => {
  console.log(`[${util.timestamp()}] ${req.method}: ${req.originalUrl}`)
  next()
})

app.get(config.routes.auth.request, (req, res) => {

  if (auth.foundConnection(req.session)) {

    console.log("Salesforce found on session:", req.sessionID)
    console.log("SF Details:", req.session.salesforce.authResponse)
    console.log("Cookie:", req.session.cookie)

    res.status(200).json({
      message: `Authenticated with: ${req.session.salesforce.authResponse.instanceUrl}`
    })

  }

  else {

    console.log("No Salesforce session found. Initializing...")

    if (req.get("source") === "session") {

      auth.session.store(req)
        .then(sf => {
          req.session.salesforce = sf
          res.sendStatus(200)
        })
        .catch(console.error)

    } else {
      res.redirect(auth.oauth2.getUrl())
    }

  }

})

app.get(config.routes.auth.callback, (req, res, next) => {

  auth.oauth2.store(req)
    .then(sf => {
      req.session.salesforce = sf

      console.log("Redirecting to Homepage.")
      res.redirect("/")

    })
    .catch(error => {
      console.error(error)
      res.status(500).json(error.message)
    })

})

app.get(config.routes.auth.revoke, (req, res) => {

  const conn = auth.getStoredConnection(req.session)

  if (req.session.salesforce.type === "oauth2") {
    conn.logoutByOAuth2(() => {
      req.session.destroy(() => {
        res.status(200).json({ message: "Logout successful." })
      })
    }).catch(error => {
      res.status(500).json(error)
    })
  } else if (req.session.salesforce.type === "session") {
    conn.logout(() => {
      req.session.destroy(() => {
        res.status(200).json({ message: "Logout successful." })
      })
    }).catch(error => {
      res.status(500).json(error)
    })
  }

})

/* HOME */

app.get("/", (req, res) => {
  res.status(200).json({
    "session": req.session
  })
})

/* ORG OPERATIONS */

app.get(config.routes.org.list, (req, res) => {

  const conn = auth.getStoredConnection(req.session)

  conn.request(process.env.API_ENDPOINT + "templates")
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error)
      res.status(500).json(error)
    })

})

app.get(config.routes.org.base + "/:template_id", (req, res) => {

  const tid = req.params.template_id
  const conn = auth.getStoredConnection(req.session)

  conn.request(process.env.API_ENDPOINT + "templates/" + tid)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error)
      res.status(500).json(error)
    })

})

app.delete(config.routes.org.base + "/:template_id", (req, res) => {

  const tid = req.params.template_id
  const conn = auth.getStoredConnection(req.session)

  conn.requestDelete(process.env.API_ENDPOINT + "templates/" + tid)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error)
      res.status(500).json(error)
    })

})

/* REPOSITORY OPERATIONS */

app.get(config.routes.repository.list, (req, res) => {

  res.status(200).json(template_list)

})

app.post(config.routes.repository.deploy, (req, res) => {

  const conn = auth.getStoredConnection(req.session)

  console.log("Deploy Attempt:", req.body.templates)=

  deploy.fromRepository(conn, req.body.templates)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      res.status(500).json(error)
    })

})

app.get(config.routes.repository.download + "/:template_name", (req, res) => {

  const tname = req.params.template_name

  //Implement

})


app.get(config.routes.dataflow.list, (req, res) => {

  const conn = auth.getStoredConnection(req.session)

  timeshift.dataflow.list(conn)
    .then(result => {
      console.log(result)
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })


})

app.post(config.routes.dataflow.base, (req, res) => {

  const conn = auth.getStoredConnection(req.session)

  timeshift.dataflow.create(conn, "dfname3", "dflabel3", {})
    .then(result => {
      console.log(result)
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })

})


app.get(config.routes.dataflow.base + "/:dataflow_id", (req, res) => {

  const conn = auth.getStoredConnection(req.session)

  const dfid = req.params.dataflow_id

  timeshift.dataflow.update(conn, dfid, "dfname3", "dflabel3", {})
    .then(result => {
      console.log(result)
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })

})
