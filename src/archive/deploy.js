require("dotenv").config()

const fs = require("fs")
const path = require("path")
const archiver = require("archiver")

const package = require("./package.js")

const DEFAULT_DEPLOY_OPTIONS = {
  allowMissingFiles: false,
  autoUpdatePackage: false,
  checkOnly: false,
  ignoreWarnings: true,
  performRetrieve: false,
  purgeOnDelete: false,
  rollbackOnError: true,
  singlePackage: false
}

const CREATE_FILE = false

const logTime = (message) => {
  console.log(new Date().toLocaleTimeString() + ":", message)
}

exports.getDownload = (template_name) => {

  // Implement

}

exports.fromRepository = (conn, template_list) => {

  const archive = archiver("zip")

  const cwd = path.join(__dirname, '..'),
        template_directory = cwd + process.env.TEMPLATE_DIR;

  const package_directory = "pkg/",
        package_file = package_directory + "package.xml",
        package_templates = package_directory + "waveTemplates/";

  // FOR DEBUG PURPOSES - to inspect archive structure
  if (CREATE_FILE) {
    const staging_directory = cwd + process.env.STAGING_DIR
    const output = fs.createWriteStream(staging_directory + "/package.zip")
    archive.pipe(output)
  }

  archive.on("error", (err) => {
    return console.error(err)
  })

  archive.on("end", () => {
    console.log("Pointer size:", archive.pointer(), "bytes.")
  })

  archive.append(package.generateXML(), { name: package_file })

  template_list.forEach((template) => {
    archive.directory(
      template_directory + template,
      package_templates + template
    )
  })

  archive.finalize()

  logTime("Starting deploy to " + conn.instanceUrl)

  const start_time = Date.now();

  conn.metadata.pollInterval = 5 * 1000;
  conn.metadata.pollTimeout = 60 * 1000;

  let deploy = conn.metadata.deploy(archive, DEFAULT_DEPLOY_OPTIONS)

  deploy
    .on("progress", logTime)
    .on("complete", logTime)
    .on("error", console.error)

  return deploy.complete(true, (error, result) => {
    if (!error) {
      console.log("Id:", result.id)
      console.log("Status:", result.status)
      console.log("Details:", result.details)
      return result
    } return error
  })

}
