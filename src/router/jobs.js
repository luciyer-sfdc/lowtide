const agenda = require(appRoot + "/src/agenda")
const ObjectId = require("mongodb").ObjectID

exports.getStatus = async (req, res) => {

  console.log("Check status of job:", req.params.job_id)

  try {

    let found_job,
        filter = { _id: new ObjectId(req.params.job_id) },
        job_list = await agenda.jobs(filter)

    if (job_list && job_list.length > 0)
      found_job = job_list[0]

    const response_object = {
      name: found_job.attrs.name,
      request_org: found_job.attrs.data.session.salesforce.auth_response.instanceUrl,
      run: found_job.attrs.lastRunAt,
      finished: found_job.attrs.lastFinishedAt,
      result: found_job.attrs.job_result
    }

    res.status(200).json(response_object)

  } catch (e) {
    console.error(e.message)
    res.status(500).json(e.message)
  }

}
