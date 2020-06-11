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

const config = require("./config"),
      auth = require("./src/auth"),
      template = require("./src/template"),
      timeshift = require("./src/timeshift"),
      util = require("./src/utils");

const db_uri = process.env.MONGODB_URI || "mongodb://localhost/dev"

mongoose.connect(db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(util.databaseConnected)
  .catch(console.error)

const app = express()

app
  .use(bodyparser.json())
  .use(express.urlencoded({ extended: true }))
  .use(session({
    genid: (req) => {
      return uuidv4()
    },
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: (60 * 60 * 1000)
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: true
  }))

app.listen(process.env.PORT || 8080, util.onStart)

/* LOG REQUESTS */

app.all(config.routes.all, util.logRequest)

/* AUTH */

app.all(config.routes.auth.required, auth.handleAuthRequired)
app.get(config.routes.auth.request, auth.visitedAuth)
app.post(config.routes.auth.request, auth.routeRequest)
app.get(config.routes.auth.callback, auth.handleOauthCallback)
app.get(config.routes.auth.revoke, auth.destroyConnection)
app.get(config.routes.auth.session, auth.describeSession)

/* TEMPLATES */

/* Org */

app.get(config.routes.org.base, template.getOrgTemplates)
app.get(config.routes.org.single, template.getSingleOrgTemplate)
app.delete(config.routes.org.single, template.deleteSingleOrgTemplate)

/* Repository */

app.get(config.routes.repository.base, template.getRepositoryTemplates)
app.post(config.routes.repository.deploy, template.deployTemplates)
app.get(config.routes.repository.deploy_status, template.getDeployStatus)
app.get(config.routes.repository.download, template.streamDownload)

/* DATAFLOW */

app.get(config.routes.dataflow.base, timeshift.getOrgDataflows)
app.post(config.routes.dataflow.base, timeshift.timeshiftDatasetArray)
app.patch(config.routes.dataflow.single, timeshift.updateDataflow)


/* DOWNLOAD & UPLOAD OPERATIONS */

//Hold

/* HOME */

app.get("/", (_, res) => res.sendStatus(200))
