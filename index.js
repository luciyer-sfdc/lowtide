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
      util = require("./src/utils"),
      agenda = require("./src/agenda"),
      router = require("./src/router");

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

app.listen(process.env.PORT || 8080, async () => {
  await agenda.start()
  util.onStart()
})

/* LOG REQUESTS */

app.route(config.ltApi("all"))
  .all(util.logRequest)

/* AUTH */

app.route(config.ltApi("auth_required"))
  .all(auth.handleAuthRequired)

app.route(config.ltApi("auth_request"))
  .get(auth.visitedAuth)
  .post(auth.routeRequest)

app.route(config.ltApi("auth_callback"))
  .get(auth.handleOauthCallback)

app.route(config.ltApi("auth_revoke"))
  .get(auth.destroyConnection)

app.route(config.ltApi("auth_session"))
  .get(auth.describeSession)

/* ORG FOLDERS, DATASETS, DATAFLOWS, TEMPLATES */

app.route(config.ltApi("org_folders"))
  .get(router.org.getOrgFolders)

app.route(config.ltApi("org_datasets"))
  .get(router.org.getOrgDatasets)

app.route(config.ltApi("org_datasets_folder"))
  .get(router.org.getOrgDatasets)

app.route(config.ltApi("org_datasets_refresh"))
  .get(router.org.refreshDatasets)

app.route(config.ltApi("org_dataflows"))
  .get(router.org.getOrgDataflows)
  .post(router.timeshift.generateDataflow)

app.route(config.ltApi("org_dataflows_folder"))
  .get(router.org.getOrgDataflows)

app.route(config.ltApi("org_dataflow_single"))
  .get(router.org.getCurrentDataflowVersion)

app.route(config.ltApi("org_templates"))
  .get(router.org.getOrgTemplates)
  .post(router.org.createTemplateFromApp)
  .patch(router.org.updateTemplateFromApp)

app.route(config.ltApi("org_template_single"))
  .get(router.org.getSingleOrgTemplate)
  .delete(router.org.deleteSingleOrgTemplate)

/* SERVER REPOSITORY: TEMPLATES */

app.route(config.ltApi("repo_templates"))
  .get(router.repo.getTemplates)

app.route(config.ltApi("repo_template_deploy"))
  .post(router.repo.deployTemplates)

/* ASYNC JOB QUEUE */

app.route(config.ltApi("job_status"))
  .get(router.jobs.getStatus)

app.get("/", (_, res) => res.sendStatus(200))
