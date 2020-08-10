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

/*

  JOB TEMPLATE

  queue.define("job_name", async job => {

    // run async job and capture result

    const job_result = await jobs.some_job()
    job.attrs.job_result = job_result

    // optionally - hit some endpoint that client listens to

  })


*/

queue.define("timeshift_datasets", async job => {

  console.log("Running job timeshift_datasets...")

  const { session, body } = job.attrs.data

  const job_result = await jobs.timeshift(session, body)

  console.log("Finished job timeshift_datasets.")

  job.attrs.job_result = job_result

})

queue.define("asd", async job => {
  console.log("qwe")
})

module.exports = queue
