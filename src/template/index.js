require("dotenv").config()

const fs = require("fs"),
      path = require("path");

const auth = require(appRoot + "/src/auth")
const deploy = require("./deploy")

const getOrgTemplates = (req, res) => {

  const conn = auth.refreshConnection(req.session)

  conn.request(process.env.API_ENDPOINT + "templates")
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error)
      res.status(500).json(error)
    })

}

const getSingleOrgTemplate = (req, res) => {

  const tid = req.params.template_id
  const conn = auth.refreshConnection(req.session)

  conn.request(process.env.API_ENDPOINT + "templates/" + tid)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error)
      res.status(500).json(error)
    })

}

const deleteSingleOrgTemplate = (req, res) => {

  const tid = req.params.template_id
  const conn = auth.refreshConnection(req.session)

  conn.requestDelete(process.env.API_ENDPOINT + "templates/" + tid)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error)
      res.status(500).json(error)
    })

}

const getRepositoryTemplates = (req, res) => {

  const template_directory = appRoot + process.env.TEMPLATE_DIR

  try {
    const template_list = fs.readdirSync(template_directory)
    res.status(200).json(template_list)
  } catch (error) {
    res.status(500).json(error)
  }

}

const deployTemplates = (req, res) => {

  const conn = auth.refreshConnection(req.session),
        template_list = req.body.templates;

  deploy.fromRepository(conn, template_list)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      res.status(500).json(error)
    })

}

const getDeployStatus = (req, res) => {

  const conn = auth.refreshConnection(req.session),
        job_id = req.params.deploy_id;

  deploy.getDeployStatus(conn, job_id)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      res.status(500).json(error)
    })


}

const streamDownload = (req, res) => {

  const tname = req.params.template_name

  //Implement
  res.sendStatus(200)

}

module.exports = {

  getOrgTemplates: getOrgTemplates,
  getSingleOrgTemplate: getSingleOrgTemplate,
  deleteSingleOrgTemplate: deleteSingleOrgTemplate,

  getRepositoryTemplates: getRepositoryTemplates,
  deployTemplates: deployTemplates,
  getDeployStatus: getDeployStatus,
  streamDownload: streamDownload,

  deploy: deploy,
  package: require("./package")
}
