
const auth = require(appRoot + "/src/auth"),
      util = require(appRoot + "/src/utils"),
      dataflow = require("./dataflow");

const getOrgDataflows = (req, res) => {

  const conn = auth.refreshConnection(req.session)

  dataflow.list(conn)
    .then(result => {
      console.log(result)
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })

}

const timeshiftDatasetArray = (req, res) => {

  if (!util.bodyHasField(req, "dataset_array"))
    return res.status(500).json({
      "message" : "Request body requires dataset_array."
    })

  const conn = auth.refreshConnection(req.session)

  dataflow.timeshiftDatasets(conn, req.body.dataset_array)
    .then(promise_array => {

      console.log(promise_array)
      res.status(200).json(promise_array)

    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })

}

const updateDataflow = (req, res) => {

  const conn = auth.refreshConnection(req.session)

  const dfid = req.params.dataflow_id
  const { name, label, defn } = req.body

  dataflow.update(conn, dfid, name, label, defn)
    .then(result => {
      console.log(result)
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })

}


module.exports = {

  getOrgDataflows: getOrgDataflows,
  timeshiftDatasetArray: timeshiftDatasetArray,
  updateDataflow: updateDataflow,

  dataflow: dataflow,
  dataset: require("./datasets"),
  models: require("./objects"),
  dates: require("./dates")
}
