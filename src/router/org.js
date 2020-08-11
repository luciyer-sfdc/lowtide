const auth = require(appRoot + "/src/auth")
const org = require(appRoot + "/src/org")

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
