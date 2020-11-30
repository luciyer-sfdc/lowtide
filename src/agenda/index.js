require("dotenv").config()

const Agenda = require("agenda"),
      jobs = require("./jobs");

const dbUri = process.env.MONGODB_URI

const connection_options = {
  db : {
    address: dbUri,
    collection: "tasks",
    options: { useNewUrlParser: true, useUnifiedTopology: true }
  }
}

const queue = new Agenda(connection_options)

queue.define("refresh_datasets", async job => {
  console.log("Running job refresh_datasets...")
  const session = job.attrs.data
  const job_result = await jobs.refreshDatasets(session)
  job.attrs.job_result = job_result
  console.log("Finished job refresh_datasets.")

})

queue.define("timeshift_datasets", async job => {
  console.log("Running job timeshift_datasets...")
  const { session, body } = job.attrs.data
  const job_result = await jobs.timeshift(session, body)
  job.attrs.job_result = job_result
  console.log("Finished job timeshift_datasets.")
})

queue.define("update_timeshift_dataflow", async job => {
  console.log("Running job update_timeshift_dataflow...")
  const { session, body } = job.attrs.data
  const job_result = await jobs.updateTimeshift(session, body)
  job.attrs.job_result = job_result
  console.log("Finished job update_timeshift_dataflow.")
})

queue.define("check_refresh_status", async job => {
    console.log("Running job check_refresh_status...")
    const session = job.attrs.data
    const job_result = await jobs.checkRefresh(session)
    job.attrs.job_result = job_result
    console.log("Finished job check_refresh_status.")
})

queue.define("deploy_s3_templates", async job => {
    console.log("Running job deploy_s3_templates...")
    const params = job.attrs.data
    const job_result = await jobs.deployS3Templates(params)
    job.attrs.job_result = job_result
    console.log("Finished job deploy_s3_templates.")
})

queue.define("update_repository", async job => {
    console.log("Running job update_repository...")
    const is_master = job.attrs.data.is_master
    const job_result = await jobs.updateRepo(is_master)
    job.attrs.job_result = job_result
    console.log("Finished job update_repository.")
})

queue.define("run_dataflow", async job => {
    console.log("Running job run_dataflow...")
    const params = job.attrs.data
    const job_result = await jobs.runDataflowCmd(params)
    job.attrs.job_result = job_result
    console.log("Finished job run_dataflow.")
})

queue.define("upload_logs", async job => {
  console.log("Running job upload_logs...")
  const job_result = await jobs.writeLogsToS3()
  job.attrs.job_result = job_result
  console.log("Finished job upload_logs.")
})


module.exports = queue
