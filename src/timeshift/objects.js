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

class EdgemartQuery {

  constructor(folder_id) {
    this.fields = [
      "Id", "CurrentId",
      "FolderId", "InsightsApplicationId",
      "DeveloperName", "MasterLabel",
      "CreatedDate", "DataRefreshDate"
    ];
    this.object = "Edgemart"
    if (folder_id)
      this.filter = "WHERE FolderId = \'" + folder_id + "\'"
    else
      this.filter = ""

  }

  get as_string () {
    return `SELECT ${this.fields.join(", ")} FROM ${this.object} ${this.filter}`
  }

}

class DataflowJobPayload {

  constructor(dataflow_id) {
    this.dataflowId = dataflow_id
    this.command = "start"
  }

}

class DataflowSObject {

  constructor(dev_name) {
    this.DeveloperName = dev_name
    this.MasterLabel = dev_name
    this.State = "Active"
  }

}

class DataflowVersionSObject {

  constructor(df_id, def) {
    this.DataflowId = df_id
    this.DataflowDefinition = def || "{}"
  }

}

module.exports = {
  LatestDateQuery: LatestDateQuery,
  EdgemartQuery: EdgemartQuery,
  DataflowJobPayload: DataflowJobPayload,
  DataflowSObject: DataflowSObject,
  DataflowVersionSObject: DataflowVersionSObject
}
