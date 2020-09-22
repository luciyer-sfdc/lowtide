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

exports.getTemplates = async (conn) => {

  console.log("Querying org WaveTemplates...")

  const orgTemplates = await conn
    .sobject("WaveTemplate")
    .find({ TemplateType : "App" })

  return orgTemplates.map(template => {

    const templateInfoAsBuffer = Buffer.from(template.TemplateInfo, "base64"),
          templateInfoAsString = templateInfoAsBuffer.toString("utf-8");
          data = JSON.parse(templateInfoAsString);

    const api_version = data.assetVersion.toString() + ".0",
          template_dashboards = data.dashboards.map(d => d.label),
          template_datasets = data.externalFiles
            .filter(d => d.type === "CSV")
            .map(d => d.label);

    return {
      org: {
        template_id: template.Id,
        last_update: template.LastModifiedDate
      },
      template: {
        api_name: data.name,
        api_version: api_version,
        label: data.label,
        description: data.description,
        version: data.releaseInfo.templateVersion,
        tags: data.tags,
        dashboards: template_dashboards,
        datasets: template_datasets
      }
    }

  })

}

exports.getSingleTemplate = async (conn, template_id) => {

  console.log("Retrieving WaveTemplate", template_id)

  const orgTemplate = await conn
    .sobject("WaveTemplate")
    .retrieve(template_id)

    const templateInfoAsBuffer = Buffer.from(orgTemplate.TemplateInfo, "base64"),
          templateInfoAsString = templateInfoAsBuffer.toString("utf-8");
          data = JSON.parse(templateInfoAsString);

    const api_version = data.assetVersion.toString() + ".0",
          template_dashboards = data.dashboards.map(d => d.label),
          template_datasets = data.externalFiles
            .filter(d => d.type === "CSV")
            .map(d => d.label);

    return {
      org: {
        template_id: orgTemplate.Id,
        last_update: orgTemplate.LastModifiedDate
      },
      template: {
        api_name: data.name,
        api_version: api_version,
        label: data.label,
        description: data.description,
        version: data.releaseInfo.templateVersion,
        tags: data.tags,
        dashboards: template_dashboards,
        datasets: template_datasets
      }
    }

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

exports.execRunDataflow = (conn, df_id) => {
  console.log("Running Dataflow...")
  const dataflowjobs_endpoint = config.sfApi("wave_dataflowjobs"),
        request_body = { dataflowId: df_id, command: "start" };
  return conn.requestPost(dataflowjobs_endpoint, request_body)
}
