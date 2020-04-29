const path = require("path")
var jsforce = require("jsforce")

const CONFIG_PATH = "../cfg/"
const sf = require(CONFIG_PATH + "salesforce")

exports.sf_endpoint = (function () {

  const base = sf.rest.base_url,
        api = sf.rest.api_version,
        dir = sf.rest.subdirectory;

  return `${base}${api}${dir}`

})();

exports.routes = require(CONFIG_PATH + "routes")
