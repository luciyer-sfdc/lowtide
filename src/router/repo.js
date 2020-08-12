require("dotenv").config()

const fsp = require("fs").promises,
      path = require("path");

const auth = require(appRoot + "/src/auth"),
      agenda = require(appRoot + "/src/agenda"),
      validation = require("./validation");

const getBranchFolder = (branch) => {

  const template_branch = branch === "beta"
    ? process.env.TEMPLATES_BETA
    : process.env.TEMPLATES_MASTER;

  return appRoot + template_branch

}

exports.getTemplates = async (req, res) => {

  const template_directory = getBranchFolder(req.params.branch)
  const org_api = parseInt(req.session.salesforce.api.version)

  let getTemplateInfo = async (template) => {

    const info_filepath = `${template_directory}${template}/template-info.json`,
          data = JSON.parse(await fsp.readFile(info_filepath, { encoding: "utf8" })),
          is_deployable = data.assetVersion <= org_api;

    return {
      label: data.label,
      api_name: data.name,
      api_version: data.assetVersion,
      deployable: is_deployable
    }

  }

  try {
    const folder_contents = await fsp.readdir(template_directory)
    const found_templates = await Promise.allSettled(folder_contents.map(getTemplateInfo))
    const template_list = found_templates.map(d => {
      if (d.status === "fulfilled")
      return d.value
    })
    res.status(200).json(template_list)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.deployTemplates = async (req, res) => {

  if (!validation.validTemplateDeploy(req))
    return res.status(400).json({
      error : "Request body malformed."
    })

  const branch = getBranchFolder(req.params.branch),
        api_version = req.session.salesforce.api.version;

  const params = {
    session: req.session,
    branch: branch,
    api_version: api_version,
    templates: req.body.templates
  }

  const deploy = await agenda.now("deploy_templates", params)

  res.status(200).json({
    job_id: deploy.attrs._id,
    run_at: deploy.attrs.nextRunAt
  })

}
