const jsforce = require("jsforce")

const config = require(appRoot + "/config")
const {
  DataflowSObject,
  DataflowVersionSObject,
  DataflowJobPayload
} = require("./objects")
const { Branch } = require("./definition")
const dates = require("./dates")

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

const generateAppTimeshiftDataflow = (conn, app_id) => {

  /*

  return Promise.allSettled(dataset_info.date_fields.map(field_info => {
    return executeQuery(conn, dataset_info, field_info)
  }))

  */

}

exports.generateBranch = (conn, dataset_id, latest_date) => {

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

          branch_settings.lp_date = parsed_results.suggested_date

          console.log(branch_settings)
          return new Branch(branch_settings)

        })
        .catch(console.error)

    })
    .catch(console.error)

}

exports.amendBranch = () => {
  //Implement: fix issue
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
