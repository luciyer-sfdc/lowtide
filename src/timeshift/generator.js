const org = require(appRoot + "/src/org")

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

  if (typeof valid_timeshift !== "string") {

    const branch_settings = {
      input_ds: dataset.dataset_name,
      output_ds: dataset.dataset_name,
      date_fields: date_fields
    }

    if (latest_date)
      branch_settings.lp_date = latest_date
    else
      branch_settings.lp_date = parsed_results.suggested_date

    console.log(`Branch Settings (${dataset_id}):`, branch_settings)

    return new Branch(branch_settings)

  } else {
    throw new Error(valid_timeshift)
  }

}

const promisifyBranch = (conn, session, dataset) => {

    return new Promise((resolve, reject) => {

      const params = {
        dataset_id: dataset.id,
        latest_date: dataset.date
      }

      generateDatasetBranch(conn, session, params)
        .then(branch => {
          console.log(`Generated Branch for ${dataset.id}`)
          resolve({
            dataset_id: dataset.id,
            branch: branch
          })
        })
        .catch(e => {
          console.log(`Rejecting ${dataset.id}: ${e.message}.`)
          reject({
            dataset_id: dataset.id,
            error: e.message
          })
        })

    })

}

const newDataflow = async (conn, df_params, dataflow_string) => {

  try {

    let df_id;

    if (df_params.operation === "create") {
      const df = await org.createDataflow(conn, {
        DeveloperName: df_params.name,
        MasterLabel: df_params.label,
        State: "Active"
      })
      df_id = df.id;
    } else {
      df_id = df_params.id;
    }

    const dfv = await org.createDataflowVersion(conn, {
      DataflowId: df_id,
      DataflowDefinition: dataflow_string
    })

    await org.assignDataflowVersion(conn, df_id, dfv.id)

    return {
      success: true,
      dataflow_id: df_id,
      dataflow_version_id: dfv.id
    }

  } catch (e) {
    console.error(e.message)
    return {
      success: false,
      message: e.message
    }
  }

}

exports.timeshiftDatasets = async (conn, session, df_params, ts_array) => {

  console.log("Generating timeshift dataflow...")

  let assignToSingleObject = (branches) => {
    const def = {}
    for (const b of branches) {
      Object.assign(def, b.object)
    } return def
  }

  const results = await Promise.allSettled(ts_array.map(dataset => {
    return promisifyBranch(conn, session, dataset)
  }))

  const branches = results.filter(d => d.status === "fulfilled"),
        errors = results.filter(d => d.status === "rejected").map(d => d.reason);

  if (branches && branches.length > 0) {

    const branch_definitions = branches.map(d => d.value.branch),
          df_definition = assignToSingleObject(branch_definitions),
          df_definition_str = JSON.stringify(df_definition),
          branch_results = branches.map(d => {
            return { dataset_id: d.value.dataset_id }
          });

    const df_result = await newDataflow(conn, df_params, df_definition_str)

    if (df_result.success) {
      df_result.branches = branch_results
      df_result.errors = errors
    }

    return df_result

  } else {

    return {
      success: false,
      message: "No dataflow generated.",
      errors: errors
    }

  }

}
