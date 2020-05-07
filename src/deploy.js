const fs = require("fs")
const path = require("path")
const archiver = require("archiver")

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

exports.fromDirectory = (conn, packageDirectoryPath) => {

  const dirname = path.basename(packageDirectoryPath)
  const cwd = path.join(packageDirectoryPath, '..')
  const archive = archiver('zip')

  archive.glob(dirname + '/**', { cwd: cwd })
  archive.finalize()

  conn.metadata.pollTimeout = 60*1000;

  conn.metadata.deploy(archive, {})
    .complete(true, (err, result) => {
      if (err) { console.error(err) }
      if (result) {
        console.log("Result", result)
        console.log("Errors", result.details.componentFailures)
      }
    })

}
