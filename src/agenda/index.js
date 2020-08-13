require("dotenv").config()

const Agenda = require("agenda")
const jobs = require("./jobs")

const db_uri = process.env.MONGODB_URI || "mongodb://localhost/dev"

const connection_options = {
  db : {
    address: db_uri,
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

queue.define("deploy_templates", async job => {

    console.log("Running job deploy_templates...")

    const params = job.attrs.data
    const job_result = await jobs.deployTemplates(params)
    job.attrs.job_result = job_result

    console.log("Finished job deploy_templates.")

})

module.exports = queue
