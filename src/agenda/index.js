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

queue.define("timeshift_datasets", async job => {

  console.log("Running job timeshift_datasets...")

  const { session, body } = job.attrs.data

  const job_result = await jobs.timeshift(session, body)

  console.log("Finished job timeshift_datasets.")

  job.attrs.job_result = job_result

})

queue.define("refresh_datasets", async job => {

  console.log("Running job refresh_datasets...")

  const session = job.attrs.data

  const job_result = await jobs.refreshDatasets(session)

  console.log("Finished job refresh_datasets.")

  job.attrs.job_result = job_result

})

queue.define("check_refresh_status", async job => {

    console.log("Running job check_refresh_status...")

    const session = job.attrs.data

    const job_result = await jobs.checkRefresh(session)

    console.log("Finished job check_refresh_status.")

    job.attrs.job_result = job_result

})

queue.define("deploy_templates", async job => {

    console.log("Running job deploy_templates...")

    const params = job.attrs.data

    const job_result = await jobs.deployTemplates(params)

    console.log("Finished job deploy_templates.")

    job.attrs.job_result = job_result

})

module.exports = queue
