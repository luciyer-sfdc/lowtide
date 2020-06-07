require("dotenv").config()

const fs = require("fs")
const path = require("path")
const archiver = require("archiver")

const package = require("./package")

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

class TemplateDeploy {

  constructor(id, status, template_list) {

  }

}

const logTime = (message) => {
  console.log(new Date().toLocaleTimeString() + ":", message)
}

exports.streamDownload = (template_name) => {
  //TODO
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

  const start_time = Date.now()

  conn.metadata.pollInterval = 1 * 1000
  conn.metadata.pollTimeout = 60 * 1000

  let deploy = conn.metadata.deploy(archive, DEFAULT_DEPLOY_OPTIONS)

  deploy.complete(true, (error, result) => {
    if (!error) {
      console.log("Id:", result.id)
      console.log("Status:", result.status)
      console.log("Details:", result.details)
      return result
    } return error
  })

  return new Promise((resolve, reject) => {
    deploy
      .on("progress", (output) => {
          console.log("Progress:", output)
          resolve(output)
      })
      .on("complete", logTime)
      .on("error", (error) => {
        console.error("Error:", error)
        reject(error)
      })
  })


}
