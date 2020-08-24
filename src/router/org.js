const auth = require(appRoot + "/src/auth")
const org = require(appRoot + "/src/org")
const agenda = require(appRoot + "/src/agenda")

exports.getOrgFolders = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getFolders(conn)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.getOrgDatasets = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getDatasets(conn, req.params.folder_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.getOrgDataflows = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getDataflows(conn, req.params.folder_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.getCurrentDataflowVersion = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getSingleDataflow(conn, req.params.dataflow_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.getOrgTemplates = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getTemplates(conn)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.getSingleOrgTemplate = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getSingleTemplate(conn, req.params.template_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.deleteSingleOrgTemplate = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.deleteSingleTemplate(conn, req.params.template_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.createTemplateFromApp = async (req, res) => {

  try {

    const params = {
      session: req.session,
      folder_id: req.body.folder_id,
      dataflow_id: req.body.dataflow_id
    }

    const conn = auth.refreshConnection(req.session)
    const result = await org.createTemplate(conn, params)

    res.status(200).json(result)

  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.updateTemplateFromApp = async (req, res) => {

  try {

    const params = {
      session: req.session,
      folder_id: req.body.folder_id,
      dataflow_id: req.body.dataflow_id
    }

    const conn = auth.refreshConnection(req.session)
    const result = await org.updateTemplate(conn, params)

    res.status(200).json(result)

  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

exports.refreshDatasets = async (req, res) => {

  const refresh = await agenda.now("refresh_datasets", req.session)
  //const confirm = await agenda.schedule("in 2 minutes", "check_refresh_status", req.session)

  res.status(200).json({
    refresh: {
      job_id: refresh.attrs._id,
      run_at: refresh.attrs.nextRunAt
    }
    })
    /*,
    confirmation: {
      job_id: confirm.attrs._id,
      run_at: confirm.attrs.nextRunAt
    }
  })*/

}
