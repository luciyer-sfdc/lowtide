const auth = require(appRoot + "/src/auth")
const generator = require(appRoot + "/src/timeshift/generator")

module.exports = async (session, body) => {

  try {

    const conn = auth.refreshConnection(session)
    const { dataflow_parameters, dataset_array } = body

    return await generator.timeshiftDatasets(
      conn,
      session,
      dataflow_parameters,
      dataset_array
    )

  } catch (e) {

    console.error(e.message)
    return { success: false, errors: [ e.message ] }

  }

}
