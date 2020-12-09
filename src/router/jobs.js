const ObjectId = require("mongodb").ObjectID

const agenda = require(appRoot + "/src/agenda")

const formatResponse = (job) => {
  return {
    name: job.attrs.name,
    run_at: job.attrs.lastRunAt,
    done_at: job.attrs.lastFinishedAt,
    result: job.attrs.job_result
  }
}

exports.checkSessionJobs = async (req, res) => {

  console.log("Check status of jobs on current session.")

  try {

    let formattedResults;

    if (req.session.jobs.length === 0)
      return res.status(422).json("No jobs found on session.")

    const sessionJobs = req.session.jobs.map(j => {
      return new ObjectId(j.job_id)
    })

    const jobResults = await agenda.jobs({ _id: { $in: sessionJobs } })

    if (jobResults && jobResults.length > 0) {
      formattedResults = jobResults.map(formatResponse)
      return res.status(200).json(formattedResults)
    } else {
      return res.status(500).json("Jobs not found in database.")
    }

  } catch (error) {
    console.error(e.message)
    return res.status(500).json(e.message)
  }

}

exports.getStatus = async (req, res) => {

  const job_id = req.params.job_id

  console.log("Check status of job:", job_id)

  try {

    const filter = { _id: new ObjectId(job_id) },
          job_list = await agenda.jobs(filter);

    if (job_list && job_list.length > 0) {
      const result = formatResponse(job_list[0])
      console.log("Job status:", result)
      res.status(200).json(result)
    } else {
      return res.status(500).json("No job found with that ID.")
    }

  } catch (e) {
    console.error(e.message)
    res.status(500).json(e.message)
  }

}
