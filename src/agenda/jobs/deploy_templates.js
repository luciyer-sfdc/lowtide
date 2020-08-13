const auth = require(appRoot + "/src/auth")
const deploy = require(appRoot + "/src/template/deploy")

module.exports = async (params) => {

  try {
    const conn = auth.refreshConnection(params.session)
    return await deploy.deployFromRepository(conn, params)
  } catch (e) {
    console.error(e.message)
    return { success: false, errors: [ e.message ] }
  }

}
