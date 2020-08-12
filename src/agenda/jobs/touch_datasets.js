const config = require(appRoot + "/config")
const auth = require(appRoot + "/src/auth")
const org = require(appRoot + "/src/org")

class TouchDataset {

  constructor(dataset_id, dataset_version_id) {
    this.load = `q = load \"${dataset_id}/${dataset_version_id}\";`
    this.foreach = `q = foreach q generate count() as 'count';`
    this.query = { "query" : `${this.load} ${this.foreach}` }
  }

  get json() {
    return JSON.stringify(this.query);
  }

}

const oneWeekAgo = () => {
  const currentDate = new Date()
  const pastDate = currentDate.getDate() - 7
  currentDate.setDate(pastDate)
  return currentDate
}

const pause = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getStaleDatasets = async (session) => {

  const conn = auth.refreshConnection(session)

  const org_datasets = await org.getDatasets(conn),
        stale_date = oneWeekAgo(),
        stale_datasets = [];

  for (const dataset of org_datasets) {

    const lqd = dataset.LastQueriedDate,
          never_queried = lqd === null,
          went_stale = new Date(lqd) < stale_date,
          no_version = dataset.CurrentId === null;

    if ((never_queried || went_stale) && !no_version) {
      stale_datasets.push({
        id: dataset.Id,
        version_id: dataset.CurrentId,
        last_queried: lqd,
        refresh_query: new TouchDataset(dataset.Id, dataset.CurrentId)
      })
    }

  }

  return stale_datasets

}

exports.firstTouch = async (session) => {

  try {

    const conn = auth.refreshConnection(session),
          query_endpoint = config.sfApi(session, "wave_query");

    let query_counter = 0;

    const status_map = new Map()

    status_map.set("308", "refreshing")
    status_map.set("402", "concurrency_limit")
    status_map.set("119", "null_version_id")

    const stale_datasets = await getStaleDatasets(session)

    console.log("Found", stale_datasets.length, "stale datasets")

    const touches = stale_datasets.map(async dataset => {

      query_counter = query_counter + 1

      console.log(`Query Dataset (${query_counter})...`)

      if (query_counter % 10 === 0) {
        console.log("Pause to reset concurrency timer.")
        return pause(3000).then(() => {
          return conn.requestPost(query_endpoint, dataset.refresh_query.query)
        })
      } else {
        return conn.requestPost(query_endpoint, dataset.refresh_query.query)
      }

    })

    const results = await Promise.allSettled(touches)

    const parsed_results = results.map(d => {
      let message;
      if (d.status === "rejected")
        message = status_map.get(d.reason.errorCode)
      else
        message = "refreshed"
      return message
    })

    return {
      success: true,
      stale: stale_datasets.length,
      results: parsed_results,
      errors: []
    }

  } catch (e) {

    console.error(e.message)
    return {
      success: false,
      errors: [ e.message ]
    }

  }

}

exports.checkRefresh = async (session) => {
  const stale_datasets = await getStaleDatasets(session)
  console.log("Found", stale_datasets.length, "stale datasets")
}
