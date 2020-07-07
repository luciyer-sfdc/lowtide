const config = require(appRoot + "/config")
const { EdgemartQuery } = require("./objects")

const pagedQuery = async (conn, endpoint, page_results, array_key) => {

  const results = await conn.request(endpoint),
        result_list = page_results.concat(results[array_key]);

  if (results.nextPageUrl)
    return pagedQuery(conn, results.nextPageUrl, result_list, array_key)
  else
    return result_list

}

exports.getFolders = (conn) => {
  return pagedQuery(conn, config.endpoints.folders, [], "folders")
}

exports.getDatasets = (conn) => {
  return pagedQuery(conn, config.endpoints.datasets, [], "datasets")
}

exports.getFoldersAndDatasets = async (conn) => {

  const all_datasets = await pagedQuery(conn, config.endpoints.datasets, [], "datasets")

  console.log(all_datasets[0])

  return all_datasets.reduce((result, d) => {
    (result[d.folder.name] = result[d.folder.name] || []).push(d)
    return result
  }, {})

}

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
