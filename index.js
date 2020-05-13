require("dotenv").config()

const { v4: uuidv4 } = require("uuid")
const shortid = require("shortid")
const jsforce = require("jsforce")
const express = require("express")
const session = require("express-session")
const bodyparser = require("body-parser")
const middleware = require('express-async-handler')

const lowtide = require("./src"),
      auth = lowtide.auth,
      util = lowtide.util,
      config = lowtide.config,
      package = lowtide.package,
      repository = lowtide.repository,
      deploy = lowtide.deploy

const app = express()

app
  .use(bodyparser.json())
  .use(express.urlencoded({ extended: true }))
  .use(session({
    genid: (req) => {
      return uuidv4()
    },
    secret: "some secret here stored in process.env",
    resave: false,
    saveUninitialized: true
  }))

app.use(function (req, res, next) {

  if (!req.session.salesforce &&
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

      // Return error and delete staging folder.
      console.error(err)

    }

  } else {
    console.log("Salesforce found on session:", req.sessionID)
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

app.get("/test/", (req, res) => {
  console.log(req.session.salesforce)
  res.sendStatus(200)
})



/*

app.get(config.routes.auth.revoke, (req, res) => {

  if (!sf.connection){
    res.status(500).json({ error: "No connection found."})
  } else {
    sf.connection.logout(err => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Logout failed."})
      }
      else {
        sf.connection = null
        console.log("Logout successful.");
        res.status(200).json({ message: "Logout successful."})
      }
    })
  }

})

app.get("/", (req, res) => {
  res.status(200).json({ message: "homepage here" })
})



app.get(config.routes.repository.list, (req, res) => {
  repository.getTemplateList().then(list => {
    res.status(200).json(list)
  }).catch(err => {
    res.status(500).json(err)
  })
})



app.get(config.routes.staging.create, middleware(async(req, res, next) => {

  const id = shortid.generate(),
        template = req.params.template_name;

  let create_result = await repository.createContainerFolder(id)

  if (create_result === null) {

    let populate_result = await repository.populateContainerFolder(id, template)

    if (populate_result === null || populate_result === undefined) {
      res.status(200).json({ folder_id: id })
    } else {
      repository.destroyContainerFolder(id).then(() => {
        res.status(500).json({ error: populate_result })
      })
    }

  } else {
    res.status(500).json({ error: create_result })
  }

}))

app.get(config.routes.staging.destroy, (req, res) => {

  const folder_id = req.params.folder_id

  repository.destroyContainerFolder(folder_id)
    .then(() => {
      res.status(200).json({ folder_id: folder_id })
    })
    .catch(err => {
      res.status(500).json(err)
    })

})



app.get(config.routes.template.deploy, (req, res) => {

  const folder_id = req.params.folder_id

  deploy.fromDirectory(sf.connection, `${repository.staging_path}/${folder_id}`)
  res.sendStatus(200)

})
app.get(config.routes.template.retrieve, (req, res) => {
  res.sendStatus(200)
})

*/
