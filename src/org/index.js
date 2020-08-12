/*

Using Salesforce Private API rather than REST API, gather object records
from the User's org.

*/

const config = require(appRoot + "/config")

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

exports.createTemplate = (conn, params) => {

  const { session, folder_id, dataflow_id } = params

  console.log("Creating new WaveTemplate...")

  const template_endpoint = config.sfApi(session, "wave_templates"),
        request_body = { folderSource: { id: folder_id }};

  if (dataflow_id)
    request_body.dataflow = { id: dataflow_id }

  return conn.requestPost(template_endpoint, request_body)

}

exports.updateTemplate = (conn, params) => {

  const { session, template_id, folder_id, dataflow_id } = params

  console.log("Updating existing WaveTemplate...")

  const template_endpoint = config.sfApi(session, "wave_templates"),
        single_template = `${template_endpoint}/${template_id}`,
        request_body = { folderSource: { id: folder_id }};

  if (dataflow_id)
    request_body.dataflow = { id: dataflow_id }

  return conn.requestPut(single_template, request_body)

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
