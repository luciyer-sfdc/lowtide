const getTimestamp = () => {
  return new Date().toLocaleTimeString()
}

exports.bodyHasField = (req, field_name) => {
  return (
    req.body[field_name] &&
    req.body[field_name] !== ""
  )
}

exports.logRequest = (req, res, next) => {
  next()
}

exports.onStart = () => {
  console.log(`[${getTimestamp()}]: Server running.`)
}

exports.databaseConnected = () => {
  console.log(`[${getTimestamp()}]: Connected to database.`)
}

exports.logAuth = (conn, userInfo) => {
  console.log("Successful Authorization:", conn.instanceUrl)
  console.log("User ID:", userInfo.id)
  console.log("Org ID:", userInfo.organizationId)
  console.log("Access Token: " + conn.accessToken)
}

exports.stayAwake = () => {}
