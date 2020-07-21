const path = require("path")

const lt_api = require("./lowtide_api")
const sf_api = require("./salesforce_api")
const sf_rest = require("./salesforce_rest")

const generateSfApiEndpoint = (session, endpoint) => {
  const base_url = session.salesforce.api.url
  const generated_path = path.join(base_url, sf_api[endpoint])
  return path.normalize(generated_path)
}

const generateLtApiEndpoint = (endpoint) => {
  return lt_api[endpoint]
}

module.exports = {
  sf_rest,
  ltApi: generateLtApiEndpoint,
  sfApi: generateSfApiEndpoint,
}
