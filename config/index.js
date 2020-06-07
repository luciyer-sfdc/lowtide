const sf = require("./salesforce")

const base = sf.rest.base_url,
      api = sf.rest.api_version,
      dir = sf.rest.subdirectory,
      df = sf.dataflow,
      dfj = sf.dataflowjob,
      ds = sf.dataset,
      qr = sf.query;

const wave = (function () {
  return `${base}${api}${dir}`
})();

const dataflows = (function () {
  return `${wave}${df}`
})();

const dataflowjobs = (function () {
  return `${wave}${dfj}`
})();

const dataset = (function () {
  return `${wave}${ds}`
})();

const query = (function () {
  return `${wave}${qr}`
})();

module.exports = {
  routes: require("./routes"),
  endpoints: {
    wave: wave,
    dataflows: dataflows,
    dataflowjobs: dataflowjobs,
    dataset: dataset,
    query: query
  }
}
