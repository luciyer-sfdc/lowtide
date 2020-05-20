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

exports.fromRepository = (conn, template_list) => {

  const archive = archiver("zip")
  const cwd = path.join(__dirname, '..')
  const staging_directory = cwd + process.env.STAGING_DIR
  const template_directory = cwd + process.env.TEMPLATE_DIR

  archive.on("error", (err) => {
    throw err;
  })

  template_list.forEach((template) => {
      archive.directory(
        template_directory + template,
        "waveTemplates/" + template
      )
  })

  archive.append(package.generateXML(), { name: "package.xml" });

  archive.finalize()

  conn.metadata.pollTimeout = 90*1000;

  conn.metadata.deploy(archive, {})
    .complete(true, (err, result) => {
      if (err) { console.error(err) }
      if (result) {
        console.log("Result", result)
        console.log("Errors", result.details.componentFailures)
      }
    })

}
