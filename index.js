require("dotenv").config()

const shortid = require("shortid")
const jsforce = require("jsforce")
const express = require("express")
const bodyparser = require("body-parser")
const middleware = require('express-async-handler')

const lowtide = require("./src"),
      util = lowtide.util,
      config = lowtide.config,
      package = lowtide.package,
      repository = lowtide.repository,
      deploy = lowtide.deploy

const sf = {
  connection: null,
  on_connect_redirect: null,
  endpoint: config.sf_endpoint
}

const oauth2 = new jsforce.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.BASE_URL + config.routes.auth.callback
})

const app = express()

app
  .use(bodyparser.json())
  .use(express.urlencoded({ extended: true }))
  .listen(process.env.PORT || 8080, () =>
    util.logStartup(config, sf, oauth2))

/* LOG ALL REQUESTS */

app.all(config.routes.all, (req, res, next) => {
  console.log(`[${util.timestamp()}] ${req.method}: ${req.originalUrl}`)
  next()
})

/* CATCH REQUESTS REQUIRING AUTH */

app.all(config.routes.require_auth, (req, res, next) => {

  if (req.get("source") === "internal" &&
      !sf.connection) {

    const session_object = {
      serverUrl: req.get("server_url"),
      sessionId: req.get("session_id"),
      version: "48.0"
    }

    sf.connection = new jsforce.Connection(session_object)

    next()

  } else if (req.url !== config.routes.auth.request &&
      req.path !== config.routes.auth.callback &&
      !sf.connection) {

    sf.on_connect_redirect = req.url
    res.redirect(config.routes.auth.request)

  } else {
    next()
  }

})

/* AUTHENTICATION */

app.get(config.routes.auth.request, (req, res) => {
  res.redirect(oauth2.getAuthorizationUrl())
})

app.get(config.routes.auth.callback, (req, res) => {

  const conn = new jsforce.Connection({ oauth2 : oauth2 })

  conn.authorize(req.query.code, function(err, userInfo) {

    if (!err) {

      util.logAuth(conn, userInfo)

      sf.connection = conn;

      if (sf.on_connect_redirect) {
        res.redirect(sf.on_connect_redirect)
      } else {
        res.redirect("/")
      }

    } else {
      console.error(err)
      res.status(500).json({ error: err })
    }

  })

})

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

/* REPOSITORY */

app.get(config.routes.repository.list, (req, res) => {
  repository.getTemplateList().then(list => {
    res.status(200).json(list)
  }).catch(err => {
    res.status(500).json(err)
  })
})

/* STAGING */

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

/* TEMPLATE */

app.get(config.routes.template.deploy, (req, res) => {

  const folder_id = req.params.folder_id

  deploy.fromDirectory(sf.connection, `${repository.staging_path}/${folder_id}`)
  res.sendStatus(200)

})
app.get(config.routes.template.retrieve, (req, res) => {
  res.sendStatus(200)
})
