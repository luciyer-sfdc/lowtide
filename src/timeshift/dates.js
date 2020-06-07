
const config = require(appRoot + "/config")
const { LatestDateQuery } = require("./objects")

const dateToString = (d) => {
  var mm = d.getUTCMonth() < 10 ? `0${d.getUTCMonth() + 1}` : d.getUTCMonth();
  var dd = d.getUTCDate() < 10 ? `0${d.getUTCDate()}` : d.getUTCDate();
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
}

const getDateFields = (conn, ds_id) => {

  const dataset_endpoint = config.endpoints.dataset + ds_id

  return conn.request(dataset_endpoint)
    .then(response => {

      return conn.request(response.currentVersionUrl)
        .then(response => {
          return {
            dataset_id: response.dataset.id,
            version_id: response.id,
            dataset_name: response.xmdMain.dataset.fullyQualifiedName,
            date_fields: response.xmdMain.dates
          }
        })
        .catch(error => {
          throw error.message
        })

    })
    .catch(error => {
      console.error(error.message)
      throw error.message
    })

}


const executeQuery = (conn, dataset_info, field_info) => {

  const query_object = new LatestDateQuery(
    dataset_info.dataset_id, dataset_info.version_id, field_info.fields.fullField
  )

  return conn.requestPost(config.endpoints.query, query_object.query)
    .then(response => {
      if (response.results.records[0].__Latest_YMD !== undefined)
        return {
          api_name: field_info.fields.fullField,
          label: field_info.label,
          date: response.results.records[0].__Latest_YMD
        }
      else
        throw new Error("No date values found in field: " + field_info.fields.fullField).message
    })


}

const getDateValues = (conn, dataset_info) => {

  return Promise.allSettled(dataset_info.date_fields.map(field_info => {
    return executeQuery(conn, dataset_info, field_info)
  }))

}

const parseResults = (result_array) => {

  const dates_found = result_array.filter(d => d.status === "fulfilled"),
        no_data = result_array.filter(d => d.status === "rejected")
        date_array = dates_found.map(d => d.value.date).sort().reverse();

  const today = new Date(),
        latest_date = new Date(date_array[0]),
        suggested_date = latest_date > today ? dateToString(today) : dateToString(latest_date);

  return { dates_found, no_data, date_array, suggested_date }

}

module.exports = {
  getDateFields: getDateFields,
  getDateValues: getDateValues,
  parseResults: parseResults
}
