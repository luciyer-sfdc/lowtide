const jsforce = require("jsforce")

const config = require(appRoot + "/config"),
      org = require(appRoot + "/src/org");

const dates = require("./dates")
const { Branch } = require("./definition")

const generateDatasetBranch = async (conn, session, params) => {

  const { dataset_id, latest_date } = params

  let getDateValue = (d) => { return d.value }

  const dataset = await dates.getDateFields(conn, session, dataset_id)
  const date_query_results = await dates.getDateValues(conn, session, dataset)
  const parsed_results = dates.parseResults(date_query_results)
  const date_fields = parsed_results.dates_found.map(getDateValue)
  const valid_timeshift = dates.validateDateFields(date_fields)

  if (valid_timeshift !== true) {

    console.error(valid_timeshift)
    return

  } else {

    const branch_settings = {
      input_ds: dataset.dataset_name,
      output_ds: dataset.dataset_name,
      date_fields: date_fields,
    }

    if (latest_date)
      branch_settings.lp_date = latest_date
    else
      branch_settings.lp_date = parsed_results.suggested_date

    console.log(`Branch Settings (${dataset_id}):`, branch_settings)

    return new Branch(branch_settings)

  }

}

exports.timeshiftDatasets = async (conn, session, df_params, ts_array) => {

  console.log("Generating timeshift dataflow...")

  let assignToSingleObject = (branches) => {
    const def = {}
    for (const b of branches) {
      if (b.value)
        Object.assign(def, b.value.object)
    } return def
  }

  const branches = await Promise.allSettled(
    ts_array.map(dataset => {
      console.log(`Generating Branch for ${dataset.id}`)
      try {
        return generateDatasetBranch(conn, session, {
          dataset_id: dataset.id,
          latest_date: dataset.date
        })
      } catch (e) {
        console.error(e.message)
      }
    })
  )

  const df_definition = assignToSingleObject(branches),
        df_definition_str = JSON.stringify(df_definition);

  /* Create net new dataflow providing @name, @label */

  if (df_params.operation === "create") {

    const df = await org.createDataflow(conn, {
      DeveloperName: df_params.name,
      MasterLabel: df_params.label,
      State: "Active"
    })

    const dfv = await org.createDataflowVersion(conn, {
      DataflowId: df.id,
      DataflowDefinition: df_definition_str
    })

    return await org.assignDataflowVersion(conn, df.id, dfv.id)

  }

  /* Overwrite existing dataflow definition providing @id */
  else if (df_params.operation === "overwrite") {

    const dfv = await org.createDataflowVersion(conn, {
      DataflowId: df_params.id,
      DataflowDefinition: df_definition_str
    })

    return await org.assignDataflowVersion(conn, df_params.id, dfv.id)

  }

}

exports.amendDataflow = (conn, session, dataset_id) => {

  //Fix LPD after first run

  // get Dataflow & parse to object

  // Confirm LPD field exists

  // replace static values with LPD field

}
