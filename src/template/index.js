require("dotenv").config()

const fs = require("fs"),
      path = require("path");

const auth = require(appRoot + "/src/auth")
const deploy = require("./deploy")

const getBranchFolder = (branch) => {

  const template_branch = branch === "beta"
    ? process.env.TEMPLATES_BETA
    : process.env.TEMPLATES_MASTER;

  return appRoot + template_branch

}

const getRepositoryTemplates = (req, res) => {

  const template_directory = getBranchFolder(req.params.branch)
  const org_api = parseInt(req.session.salesforce.api.version)

  let getTemplateInfo = (template) => {
    const info_filepath = `${template_directory}${template}/template-info.json`
    const data = JSON.parse(fs.readFileSync(info_filepath))
    const is_deployable = data.assetVersion <= org_api
    return {
      label: data.label,
      api_name: data.name,
      api_version: data.assetVersion,
      deployable: is_deployable
    }
  }

  try {
    const template_list = fs.readdirSync(template_directory).map(getTemplateInfo)
    res.status(200).json(template_list)
  } catch (error) {
    res.status(500).json(error)
  }

}

const deployTemplates = (req, res) => {

  const conn = auth.refreshConnection(req.session),
        version = req.session.salesforce.api.version,
        template_directory = getBranchFolder(req.params.branch),
        template_list = req.body.templates;

  deploy.fromRepository(conn, version, template_directory, template_list)
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

  getRepositoryTemplates: getRepositoryTemplates,
  deployTemplates: deployTemplates,
  getDeployStatus: getDeployStatus,
  streamDownload: streamDownload,

  deploy: deploy,
  manifest: require("./manifest")
}
