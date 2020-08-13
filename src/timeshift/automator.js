const org = require(appRoot + "/src/org")

exports.amendDataflow = async (conn, dataflow_id) => {

  let isComputeAux = (d) => { return d.startsWith("Compute_Aux") }
  let isElapsedSeconds = (d) => { return d.name === "ElapsedSeconds" }
  let makeDynamic = (d) => {
    return d.replace(/toDate\(\d+\)/g, "toDate(\'LastProcessedDate_sec_epoch\')")
  }

  const dataflow = await org.getSingleDataflow(conn, dataflow_id),
        dataflow_def = JSON.parse(dataflow.currentVersion.DataflowDefinition),
        compute_nodes = Object.keys(dataflow_def).filter(isComputeAux);

  compute_nodes.map(d => {

    const computed_fields = dataflow_def[d].parameters.computedFields

    computed_fields.forEach((dd, i) => {
      if (isElapsedSeconds(dd)) {
        const updated_saql = makeDynamic(dd.saqlExpression),
              related_field = dataflow_def[d].parameters.computedFields[i];
        related_field.saqlExpression = updated_saql
      }
    })

  })

  const dfv = await org.createDataflowVersion(conn, {
    DataflowId: dataflow_id,
    DataflowDefinition: JSON.stringify(dataflow_def)
  })

  await org.assignDataflowVersion(conn, dataflow_id, dfv.id)

  return {
    success: true,
    dataflow_id: dataflow_id,
    dataflow_version_id: dfv.id
  }

}
