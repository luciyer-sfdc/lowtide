const auth = require(appRoot + "/src/auth"),
      agenda = require(appRoot + "/src/agenda"),
      repo = require(appRoot + "/src/repo"),
      validation = require("./validation");

exports.getTemplates = async (req, res) => {

  try {

  const params = {
    branch: req.params.branch,
    org_api: parseInt(req.session.salesforce.api.version)
  }

  const result = await repo.getTemplateManifest(params)
  res.status(200).json(result)

  } catch (e) {
    console.error(e.message)
    res.status(500).json(e.message)
  }

}

exports.deployFromS3 = async (req, res) => {

  if (!validation.validTemplateDeploy(req))
    return res.status(400).json({
      error : "Request body malformed."
    })

  const params = {
    session: req.session,
    branch: req.params.branch,
    template_keys: req.body.templates
  }

  const deploy = await agenda.now("deploy_s3_templates", params)

  res.status(200).json({
    job_id: deploy.attrs._id,
    run_at: deploy.attrs.nextRunAt
  })


}
