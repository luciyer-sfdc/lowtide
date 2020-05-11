exports.logStartup = (config, oauth2) => {
  console.log("### API ROUTES ###\n", config.routes)
  console.log("### OAUTH ###\n", oauth2)
  console.log("\n\nLISTENING...\n\n")
}

exports.timestamp = () => {
  return new Date().toLocaleTimeString()
}

exports.logAuth = (conn, userInfo) => {
  console.log("Successful Authorization:", conn.instanceUrl)
  console.log("User ID:", userInfo.id)
  console.log("Org ID:", userInfo.organizationId)
  console.log("Access Token: " + conn.accessToken)
}

exports.scheduleDelete = (date, folder_id) => {

}
