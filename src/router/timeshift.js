const agenda = require(appRoot + "/src/agenda")

const validation = require("./validation")

exports.dataflowOperation = async (req, res) => {

  if (!validation.validDataflowOperation(req))
    return res.status(400).json({
      error : "Request body malformed."
    })

  const params = {
    session: req.session,
    body: req.body
  }

  let queued_job;

  if (req.body.dataflow_parameters.operation === "dynamic")
    queued_job = await agenda.now("update_timeshift_dataflow", params)
  else
    queued_job = await agenda.now("timeshift_datasets", params)

  const jobInfo = {
    job_name: "Timeshifting Operation",
    job_details: {
      operation: req.body.dataflow_parameters,
      datasets: req.body.dataset_array
    },
    job_id: queued_job.attrs._id,
    run_at: queued_job.attrs.nextRunAt
  }

  req.session.jobs.push(jobInfo)

  res.status(200).json(jobInfo)

}
