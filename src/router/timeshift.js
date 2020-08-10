const agenda = require(appRoot + "/src/agenda")
const auth = require(appRoot + "/src/auth")
const timeshift = require(appRoot + "/src/timeshift")

const validation = require("./validation")

exports.generateDataflow = async (req, res) => {

  if (!validation.validDataflowOperation(req))
    return res.status(400).json({
      error : "Request body malformed."
    })

  const params = {
    session: req.session,
    body: req.body
  }

  const queued_job = await agenda.now("timeshift_datasets", params)

  res.status(200).json({
    job_id: queued_job.attrs._id,
    run_at: queued_job.attrs.nextRunAt
  })

}

exports.getOrgDataflows = async (req, res) => {

  const conn = auth.refreshConnection(req.session)

  try {
    const result = await dataflow.list(conn, req.session)
    res.status(200).json(result)
  } catch (e) {
    console.error(e.message)
    res.status(500).json(e.message)
  }

}
