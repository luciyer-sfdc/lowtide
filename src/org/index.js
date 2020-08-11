/*

Using Salesforce Private API rather than REST API, gather object records
from the User's org.

*/

exports.getFolders = (conn) => {
  console.log("Querying org Insights Folders...")
  return conn
    .sobject("Folder")
    .find({ Type: "Insights" })
}

exports.getDatasets = (conn, filter_by_folder_id) => {
  console.log("Querying org Edgemarts...")
  return conn
    .sobject("EdgeMart")
    .find({ FolderId: filter_by_folder_id })
}

exports.getDataflows = (conn, filter_by_folder_id) => {
  console.log("Querying org Dataflows...")
  return conn
    .sobject("Dataflow")
    .find({ FolderId: filter_by_folder_id })
}

exports.getSingleDataflow = async (conn, dataflow_id) => {

  console.log("Retrieving Dataflow and current version...")

  const df = await conn
    .sobject("Dataflow")
    .retrieve(dataflow_id)

  const dfv = await conn
    .sobject("DataflowVersion")
    .retrieve(df.CurrentId)

  return {
    dataflow: df,
    currentVersion: dfv
  }

}

exports.getTemplates = (conn) => {
  console.log("Querying org WaveTemplates...")
  return conn
    .sobject("WaveTemplate")
    .find({ TemplateType : "App" })
}

exports.getSingleTemplate = (conn, template_id) => {
  console.log("Retrieving WaveTemplate", template_id)
  return conn
    .sobject("WaveTemplate")
    .retrieve(template_id)
}

exports.deleteSingleTemplate = (conn, template_id) => {
  console.log("Deleting WaveTemplate", template_id)
  return conn
    .sobject("WaveTemplate")
    .destroy(template_id)
}

exports.createDataflow = (conn, dataflow) => {
  console.log("Creating Dataflow...")
  return conn
    .sobject("Dataflow")
    .create(dataflow)
}

exports.createDataflowVersion = (conn, dataflow_version) => {
  console.log("Creating DataflowVersion...")
  return conn
    .sobject("DataflowVersion")
    .create(dataflow_version)
}

exports.assignDataflowVersion = (conn, df_id, dfv_id) => {
  console.log("Updating Dataflow with DataflowVersion...")
  return conn
    .sobject("Dataflow")
    .update({
      Id: df_id,
      CurrentId: dfv_id
    })
}
