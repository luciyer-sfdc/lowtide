const { EdgemartQuery } = require("./objects")

exports.getFolderDatasets = (conn, filter_by_folder_id) => {

  const edgemart_query = new EdgemartQuery(filter_by_folder_id)

  return conn.query(edgemart_query.as_string)

}

exports.parseResults = (results_array) => {
  return results_array.records.map(d => {
    return {
      name: d.DeveloperName,
      id: d.Id,
      version_id: d.CurrentId
    }
  })
}
