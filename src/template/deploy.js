require("dotenv").config()

const fs = require("fs")
const path = require("path")
const archiver = require("archiver")

const manifest = require("./manifest")

const DEFAULT_DEPLOY_OPTIONS = {
  allowMissingFiles: false,
  autoUpdatePackage: true,
  checkOnly: false,
  ignoreWarnings: false,
  performRetrieve: false,
  purgeOnDelete: false,
  rollbackOnError: true,
  singlePackage: false
}

const CREATE_FILE = false

const logTime = (message) => {
  console.log(new Date().toLocaleTimeString() + ":", message)
}

exports.streamDownload = (req, res, template_list) => {

  //TODO
}

const makeArchive = (api_version, template_directory, template_list) => {

  console.log("Packaging:", template_list)

  const local = {
    static: appRoot + process.env.STATIC_DIR,
    debug: appRoot + process.env.DEBUG_DIR,
    templates: template_directory
  }

  const package = {
    file: "package.zip",
    manifest: "pkg/package.xml",
    templates: "pkg/waveTemplates/",
    static_resources: "pkg/staticresources/"
  }

  return new Promise((resolve, reject) => {

    const archive = archiver("zip")

    archive.on("error", (error) => {
      console.error(error)
      reject(error)
    })

    archive.on("finish", () => {
      console.log(`Archive created (${archive.pointer()} bytes).`)
      resolve(archive)
    })


    if (CREATE_FILE)
      archive.pipe(fs.createWriteStream(local.debug + package.file))

    // Append package.xml manifest
    archive.append(manifest.generate(api_version), { name: package.manifest })

    // Append static resources
    archive.directory(local.static, package.static_resources)

    // Add analytics app templates
    template_list.forEach((template) => {
      archive.directory(
        local.templates + template,
        package.templates + template)
    })

    archive.finalize()

  })

}

exports.fromRepository = async (conn, api_version, template_directory, template_list) => {

  console.log("Packaging:", template_list)

  const local = {
    static: appRoot + process.env.STATIC_DIR,
    debug: appRoot + process.env.DEBUG_DIR,
    templates: template_directory
  }

  const package = {
    file: "package.zip",
    manifest: "pkg/package.xml",
    templates: "pkg/waveTemplates/",
    static_resources: "pkg/staticresources/"
  }


  const archive = archiver("zip")

  archive.on("error", (error) => {
    console.error(error)
  })

  archive.on("finish", () => {
    console.log(`Archive created (${archive.pointer()} bytes).`)
  })


  if (CREATE_FILE)
    archive.pipe(fs.createWriteStream(local.debug + package.file))

  // Append package.xml manifest
  archive.append(manifest.generate(api_version), { name: package.manifest })

  // Append static resources
  archive.directory(local.static, package.static_resources)

  // Add analytics app templates
  template_list.forEach((template) => {
    archive.directory(
      local.templates + template,
      package.templates + template)
  })

  archive.finalize()


  logTime("Uploading to " + conn.instanceUrl)

  const start_time = Date.now()

  conn.metadata.pollInterval = 1 * 1000
  conn.metadata.pollTimeout = 60 * 1000

  let deploy = conn.metadata.deploy(archive, DEFAULT_DEPLOY_OPTIONS)

  return new Promise((resolve, reject) => {

    deploy.complete(true, (error, result) => {
      if (!error) {
        console.log(result)
        resolve(result)
      } else {
        console.error(error)
        reject(error)
      }
    })

    deploy
      .on("progress", (output) => {
        console.log(output)
        resolve(output)
      })
      .on("complete", (output) => {
        console.log(output)
        resolve(output)
      })
      .on("error", (error) => {
        console.error(error)
        reject(error)
      })

  })

}

exports.getDeployStatus = (conn, job_id) => {
  return conn.metadata.checkDeployStatus(job_id, true)
}
