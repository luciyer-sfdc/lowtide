const config = require(appRoot + "/config")
const auth = require(appRoot + "/src/auth")
const org = require(appRoot + "/src/org")

const queryErrorMap = () => {
  const status_map = new Map()
  status_map.set("119", "null_version_id")
  status_map.set("308", "refreshing")
  status_map.set("402", "concurrency_limit")
  return status_map
}

const batchArray = (array, batch_size) => {
  return array.reduce((temp, x, i) => {
    const sub_index = Math.floor(i / batch_size)
    if(!temp[sub_index])
      temp[sub_index] = []
    temp[sub_index].push(x)
    return temp
  }, [])
}

class TouchQuery {
  constructor(dataset_id, dataset_version_id) {
    this.load = `q = load \"${dataset_id}/${dataset_version_id}\";`
    this.foreach = `q = foreach q generate count() as 'count';`
    this.query = { "query" : `${this.load} ${this.foreach}` }
  }
}

const getAllDatasets = async (conn) => {

  const org_datasets = await org.getDatasets(conn)

  return org_datasets
    .filter(d => d.CurrentId !== null)
    .map(d => {
      return {
        id: d.Id,
        label: d.MasterLabel,
        version_id: d.CurrentId,
        last_queried: d.LastQueriedDate,
        refresh: new TouchQuery(d.Id, d.CurrentId)
      }
  })

}

exports.firstTouch = async (session) => {

  try {

    const reporting_errors = [],
          query_results = {
            refreshed : [],
            refreshing: [],
            concurrency_limit: [],
            null_version_id: []
          };

    const conn = auth.refreshConnection(session),
          org_datasets = await getAllDatasets(conn),
          query_endpoint = config.sfApi(session, "wave_query"),
          status_map = queryErrorMap();

    // Split datasets into batches of 10.
    const batched_datasets = batchArray(org_datasets, 10)

    // Batch by batch...
    for (const batch of batched_datasets) {

      console.log("Querying Batch:", batch.map(d => `${d.id}/${d.version_id}`))

      // ... execute all queries in parallel and await that all "settle"
      const batch_results = await Promise.allSettled(batch.map(async dataset => {

        return new Promise(async (resolve, reject) => {
          try {

            const resp = await conn.requestPost(query_endpoint, dataset.refresh.query)

            resolve({
              id: dataset.id,
              label: dataset.label,
              response: resp
            })

          } catch (e) {

            reject({
              id: dataset.id,
              label: dataset.label,
              response: e
            })

          }
        })

      }))


      // Parse results to create response with statuses
      const parsed_results = batch_results
        .map(d => {

          try {

            let message, passed;

            if (d.status === "rejected") {
              message = status_map.get(d.reason.response.errorCode) || "error"
              passed = d.reason
            } else {
              message = "refreshed"
              passed = d.value
            }

            query_results[message].push({
              id: passed.id, label: passed.label
            })

          } catch (e) {
            reporting_errors.push(e.message)
          }

        })

    }

    // Return Status

    return {
      success: true,
      datasets: org_datasets.length,
      results: query_results,
      errors: reporting_errors
    }


  } catch (e) {

    console.error(e.message)

    return {
      success: false,
      errors: [ e.message ]
    }

  }

}
