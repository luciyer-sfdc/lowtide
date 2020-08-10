
const auth = require(appRoot + "/src/auth"),
      util = require(appRoot + "/src/utils"),
      agenda = require(appRoot + "/src/agenda")
      dataflow = require("./dataflow"),
      datasets = require("./datasets");

const getOrgFoldersAndDatasets = (req, res) => {

  const conn = auth.refreshConnection(req.session)

  datasets.getDatasets(conn)
    .then(result => {
      console.log(result)
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })

}


const getOrgDataflows = (req, res) => {

  const conn = auth.refreshConnection(req.session)

  dataflow.list(conn, req.session)
    .then(result => {
      console.log(result)
      res.status(200).json(result)
    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })

}

const timeshiftTest = dataflow.timeshiftDatasets

const timeshiftDatasetArray = (req, res) => {

  if (!util.bodyHasField(req, "dataset_array"))
    return res.status(500).json({
      "message" : "Request body requires dataset_array."
    })

  const conn = auth.refreshConnection(req.session)

  dataflow.timeshiftDatasets(conn, req.session, req.body.dataflow_name, req.body.dataset_array)
    .then(promise_array => {

      console.log(promise_array)
      res.status(200).json(promise_array)

    })
    .catch(error => {
      console.error(error.message)
      res.status(500).json(error.message)
    })

}

const overwriteDataflow = (req, res) => {

  const conn = auth.refreshConnection(req.session)

  dataflow.overwriteDataflow(conn, req.session, req.body.dataflow_id, req.body.dataset_array)
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

  timeshiftTest: timeshiftTest,
  
  getOrgFoldersAndDatasets: getOrgFoldersAndDatasets,
  getOrgDataflows: getOrgDataflows,
  timeshiftDatasetArray: timeshiftDatasetArray,
  overwriteDataflow: overwriteDataflow,
  updateDataflow: updateDataflow,

  dataflow: require("./dataflow"),
  dataset: require("./datasets"),
  models: require("./objects"),
  dates: require("./dates")
}
