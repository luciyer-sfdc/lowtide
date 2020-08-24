const path = require("path")

const lt_api = require("./lowtide_api"),
      sf_api = require("./salesforce_api"),
      sf_rest = require("./salesforce_rest"),
      deploy_options = require("./deploy_options"),
      aws = require("./aws");

const generateSfApiEndpoint = (session, endpoint) => {
  const base_url = session.salesforce.api.url
  const generated_path = path.join(base_url, sf_api[endpoint])
  return path.normalize(generated_path)
}

const generateLtApiEndpoint = (endpoint) => {
  return lt_api[endpoint]
}

module.exports = {
  aws,
  sf_rest,
  deploy_options,
  ltApi: generateLtApiEndpoint,
  sfApi: generateSfApiEndpoint,
}
