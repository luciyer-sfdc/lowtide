const auth = require(appRoot + "/src/auth")
const automator = require(appRoot + "/src/timeshift/automator")

module.exports = async (session, body) => {

  try {

    const conn = auth.refreshConnection(session),
          dataflow_id = body.dataflow_parameters.id;

    return await automator.amendDataflow(conn, dataflow_id)

  } catch (e) {
    console.error(e.message)
    return { success: false, errors: [ e.message ] }
  }

}
