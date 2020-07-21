const config = require(appRoot + "/config")

module.exports = async (conn) => {

  console.log("Getting Org API Version.")

  const versions_endpoint = "/services/data"

  try {

    // Get latest api version from org.
    const version_list = await conn.request(versions_endpoint)
    return version_list.pop()

  } catch (e) {

    // Fallback to default defined in config/salesforce_rest.json
    console.error(e)
    return config.sf_rest

  }

}
