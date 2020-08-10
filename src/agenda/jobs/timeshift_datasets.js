const auth = require(appRoot + "/src/auth")
const dataflow = require(appRoot + "/src/timeshift/dataflow")

module.exports = async (session, body) => {

  const conn = auth.refreshConnection(session)

  const { dataflow_parameters, dataset_array } = body

  try {

    const generate_result = await dataflow.timeshiftDatasets(
      conn,
      session,
      dataflow_parameters,
      dataset_array
    )

    return generate_result

  } catch (e) {

    console.error(e.message)
    return { success: false, errors: [ e.message ] }

  }

}
