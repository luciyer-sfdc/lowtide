const objectHas = (obj, field_name) => {
  return (obj[field_name] && obj[field_name] !== "")
}

const matchValue = (obj, field_name, field_value) => {
  return (objectHas(obj, field_name) && obj[field_name] === field_value)
}

exports.validDataflowOperation = (req) => {

  const has_params = objectHas(req.body, "dataflow_parameters")

  const valid_create = (
    matchValue(req.body.dataflow_parameters, "operation", "create") &&
    objectHas(req.body.dataflow_parameters, "name") &&
    objectHas(req.body.dataflow_parameters, "label")
  )

  const valid_overwrite = (
    matchValue(req.body.dataflow_parameters, "operation", "overwrite") &&
    objectHas(req.body.dataflow_parameters, "id")
  )

  return (has_params && (valid_create || valid_overwrite))

}
