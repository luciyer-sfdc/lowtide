const sf = require("./salesforce")

const base = sf.rest.base_url,
      api = sf.rest.api_version,
      dir = sf.rest.subdirectory,
      df = sf.dataflow;

const wave = (function () {
  return `${base}${api}${dir}`
})();

const dataflows = (function () {
  return `${wave}${df}`
})();

module.exports = {
  routes: require("./routes"),
  endpoints: {
    wave: wave,
    dataflows: dataflows
  }
}
