const jsforce = require("jsforce")

const config = require(appRoot + "/config")
const dates = require("./dates")
const dataset = require("./datasets")

const { Branch } = require("./definition")
const {
  DataflowSObject,
  DataflowVersionSObject,
  DataflowJobPayload
} = require("./objects")

const df_endpoint = config.endpoints.dataflows,
      dfjob_endpoint = config.endpoints.dataflowjobs;

const createDfVersion = (conn, df_id, defn) => {

  const df_version_object = new DataflowVersionSObject(df_id, defn)

  return conn
    .sobject("DataflowVersion")
    .create(df_version_object)

}

const updateDfCurrentId = (conn, df_id, df_vid) => {

  return conn
    .sobject("Dataflow")
    .update({
      Id: df_id,
      CurrentId: df_vid
    })

}

const getDatasetBranch = (conn, dataset_id, latest_date) => {

  const branch_settings = {}

  return dates.getDateFields(conn, dataset_id)
    .then(dataset => {

      branch_settings.input_ds = dataset.dataset_name;
      branch_settings.output_ds = dataset.dataset_name + "_shifted";

      return dates.getDateValues(conn, dataset)
        .then(query_results => {

          const parsed_results = dates.parseResults(query_results)

          branch_settings.date_fields = parsed_results.dates_found.map(d => {
            return d.value
          })

          if (latest_date)
            branch_settings.lp_date = latest_date
          else
            branch_settings.lp_date = parsed_results.suggested_date

          return new Branch(branch_settings)

        })
        .catch(console.error)

    })
    .catch(console.error)

}

const generateAppTimeshiftDataflow = (conn, ts_array) => {

  /*
  ts_array = [
    { id: xxx, date: yyyy-mm-dd },
    { id: xxx, date: yyyy-mm-dd }
  ]
  */

  return Promise.allSettled(ts_array.map(dataset => {

    if (dataset.date)
      return getDatasetBranch(conn, dataset.id, dataset.date)
    else
      return getDatasetBranch(conn, dataset.id)

  }))


}

exports.timeshiftDatasets = (conn, dataset_array) => {
  return generateAppTimeshiftDataflow(conn, dataset_array)
}

exports.generateBranch = (conn, dataset_id, latest_date) => {
  return getDatasetBranch(conn, dataset_id, latest_date)
}

exports.amendDataflow = () => {
  //Implement: fix LPD after first run
}

exports.list = (conn) => {

  return conn.request(df_endpoint)

}

exports.create = (conn, name, defn) => {

  const df_object = new DataflowSObject(name)

  console.log("Creating Dataflow \"" + name + "\"")

  return conn
    .sobject("Dataflow")
    .create(df_object)
    .then(df => {

      console.log("Created.", df.id)
      console.log("Creating Dataflow Version...")

      return createDfVersion(conn, df.id, defn)
        .then(dfv => {

          console.log("Created.", dfv.id)
          console.log("Updating Dataflow CurrentId to Version Id...")

          return updateDfCurrentId(conn, df.id, dfv.id)


        })
        .catch(err => {
          throw new Error(err)
        })

    })
    .catch(console.error)

}

exports.update = (conn, dataflow_id, defn) => {

  return createDfVersion(conn, dataflow_id, defn)
    .then(dfv => {

      console.log("Created.", dfv.id)
      console.log("Updating Dataflow CurrentId to Version Id...")

      return updateDfCurrentId(conn, dataflow_id, dfv.id)


    })
    .catch(err => {
      throw new Error(err)
    })

}

exports.run = (conn, dataflow_id) => {

  const job_payload = new DataflowJobPayload(dataflow_id)

  return conn.requestPost(dfjob_endpoint, job_payload)

}

exports.status = (conn, dataflow_job_id) => {

  return conn.request(dfjob_endpoint + dataflow_job_id)

}
