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

/* ORG TEMPLATES, DATASETS, DATAFLOWS */

app.route(config.ltApi("org_templates"))
  .get(template.getOrgTemplates)

app.route(config.ltApi("org_template_single"))
  .get(template.getSingleOrgTemplate)
  .delete(template.deleteSingleOrgTemplate)

app.route(config.ltApi("org_datasets"))
  .get(timeshift.getOrgFoldersAndDatasets)

app.route(config.ltApi("org_dataflows"))
  .get(timeshift.getOrgDataflows)
  .post(timeshift.timeshiftDatasetArray)

app.route(config.ltApi("repo_templates"))
  .get(template.getRepositoryTemplates)
  .post(template.deployTemplates)

app.route(config.ltApi("repo_template_deploy_status"))
  .get(template.getDeployStatus)

app.get("/", (_, res) => res.sendStatus(200))

/*

app.get(config.routes.repository.base, template.getRepositoryTemplates)
app.post(config.routes.repository.base, template.deployTemplates)
app.get(config.routes.repository.deploy_status, template.getDeployStatus)
app.get(config.routes.repository.download, template.streamDownload)



app.get(config.routes.dataset.base, timeshift.getOrgFoldersAndDatasets)



app.get(config.routes.dataflow.base, timeshift.getOrgDataflows)
app.post(config.routes.dataflow.base, timeshift.timeshiftDatasetArray)
app.patch(config.routes.dataflow.single, timeshift.updateDataflow)


*/
