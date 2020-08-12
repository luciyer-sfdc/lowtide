const config = require(appRoot + "/config")

class LatestDateQuery {

  constructor(dataset_id, dataset_version_id, field) {
    this.field = field;
    this.load = `q = load \"${dataset_id}/${dataset_version_id}\";`;
    this.foreach = `q = foreach q generate '${field}_Year' + \"-\" + '${field}_Month' + \"-\" + '${field}_Day' as '__Latest_YMD', count() as 'count';`;
    this.order = `q = order q by '__Latest_YMD' desc;`;
    this.limit = `q = limit q 1;`;

    this.query = { "query" : `${this.load} ${this.foreach} ${this.order} ${this.limit}` };

  }

  get json() {
    return JSON.stringify(this.query);
  }

}

const dateToString = (d) => {
  var mm = d.getUTCMonth() < 9 ? `0${d.getUTCMonth() + 1}` : d.getUTCMonth() + 1;
  var dd = d.getUTCDate() < 10 ? `0${d.getUTCDate()}` : d.getUTCDate();
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
}

const getApiName = (d) => { return d.api_name }

const validateDateFields = (field_list) => {

  console.log("Validating Date Fields...")

  if (!field_list || field_list.length === 0)
    return "No date columns found."

  if (field_list.map(getApiName).includes("LastProcessedDate"))
    return "Found LastProcessedDate column."

  return true

}

const getDateFields = (conn, session, ds_id) => {

  const dataset_endpoint = config.sfApi(session, "wave_datasets") + "/" + ds_id

  return conn.request(dataset_endpoint)
    .then(response => {

      const dataset_name = response.name

      return conn.request(response.currentVersionUrl)
        .then(response => {

          return {
            dataset_id: response.dataset.id,
            version_id: response.id,
            dataset_name: dataset_name,
            date_fields: response.xmdMain.dates
          }
        })
        .catch(error => {
          throw new Error(error.message)
        })

    })
    .catch(error => {
      console.error(error.message)
      throw new Error(error.message)
    })

}

const executeQuery = (conn, session, dataset_info, field_info) => {

  const query_object = new LatestDateQuery(
    dataset_info.dataset_id,
    dataset_info.version_id,
    field_info.fields.fullField
  )

  return conn.requestPost(config.sfApi(session, "wave_query"), query_object.query)
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

const getDateValues = (conn, session, dataset_info) => {

  return Promise.allSettled(dataset_info.date_fields.map(field_info => {
    return executeQuery(conn, session, dataset_info, field_info)
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
  validateDateFields: validateDateFields,
  getDateFields: getDateFields,
  getDateValues: getDateValues,
  parseResults: parseResults
}
