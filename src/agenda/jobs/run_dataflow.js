const auth = require(appRoot + "/src/auth"),
      org = require(appRoot + "/src/org");

module.exports = async (params) => {

  try {

    const { session, dataflow_id } = params

    const conn = auth.refreshConnection(session)

    const jobExecutionResponse = await org.execRunDataflow(conn, dataflow_id)
    return jobExecutionResponse

  } catch (e) {

    console.error(e.message)
    return { success: false, errors: [ e.message ] }

  }

}
