const config = require(appRoot + "/config")
const {
  FolderQuery,
  EdgemartQuery
} = require("./objects")


const parseResults = (results_array) => {
  return results_array.records.map(d => {
    return {
      name: d.DeveloperName,
      id: d.Id,
      version_id: d.CurrentId
    }
  })
}

const getFolders = (conn) => {
  const folder_query = new FolderQuery()
  return conn.query(folder_query.as_string)
}

const getDatasets = (conn, filter_by_folder_id) => {
  const edgemart_query = new EdgemartQuery(filter_by_folder_id)
  return conn.query(edgemart_query.as_string)
}

const getDatasetsByFolder = async (conn) => {
  return {}
}

module.exports = {
  getFolders,
  getDatasets,
  getDatasetsByFolder
}
