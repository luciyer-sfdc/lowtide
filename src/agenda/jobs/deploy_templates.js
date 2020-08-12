const auth = require(appRoot + "/src/auth")
const deploy = require(appRoot + "/src/template/deploy")

module.exports = async (params) => {

  try {

    const conn = auth.refreshConnection(params.session)

    const deploy_result = await deploy.deployFromRepository(
      conn,
      params
    )

    return deploy_result

  } catch (e) {

    console.error(e.message)
    return { success: false, errors: [ e.message ] }

  }

}
