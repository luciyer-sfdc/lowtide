const path = require("path")
const fsp = require("fs").promises
const copyDirectory = require("ncp").ncp

const package = require("./package.js")
const WaveTemplate = require("./template_object.js")

const T_REPO = path.normalize("./template_repository")
const T_STAGING = path.normalize("./staging_repository")

async function getTemplateList () {

  let result = await fsp.readdir(T_REPO)

  if (result instanceof Array) {
    console.log("Fetched template list:", result)
  } else {
    console.error(result)
  }

  return result

}

async function createContainerFolder (unique_id) {

  const folder_path = `${T_STAGING}/${unique_id}/waveTemplates`
  let result = await fsp.mkdir(folder_path, { recursive: true })

  if (result === undefined) {
    console.log(`${unique_id}: Created.`)
    return null
  } else {
    console.error(result)
    return result
  }

}

async function createPackageFile (unique_id) {

  const package_file = `${T_STAGING}/${unique_id}/package.xml`
  let result = await fsp.writeFile(package_file, package.generateXML())

  if (result === undefined) {
    console.log(`${unique_id}: Created package.xml`)
    return null
  } else {
    console.error(result)
    return result
  }

}

async function populateContainerFolder (unique_id, template_name) {

  const source = `${T_REPO}/${template_name}`,
        destination = `${T_STAGING}/${unique_id}/waveTemplates/${template_name}`;

  return fsp.access(source).then(() => {

    copyDirectory(source, destination, async (err) => {

      if (err) {
        console.error(err)
        return err
      } else {
        console.log(`${unique_id}: Copied ${template_name}.`)
        let result = await createPackageFile(unique_id)
        return result
      }

    })

  }).catch(err => {
    console.error(err)
    return JSON.stringify(err)
  })

}

async function destroyContainerFolder (unique_id) {

  const folder_path = `${T_STAGING}/${unique_id}`

  let not_exist = await fsp.access(folder_path)

  if (not_exist !== undefined) {
    console.error(not_exist)
    return not_exist
  }

  let result = await fsp.rmdir(folder_path, { recursive: true })

  if (result === undefined) {
    console.log(`${unique_id}: destroyed.`)
    return null
  } else {
    console.error(result)
    return result
  }

}

function pullFromRepository (branch_name) {

}

module.exports = {
  repository_path: T_REPO,
  staging_path: T_STAGING,
  pullFromRepository: pullFromRepository,
  getTemplateList: getTemplateList,
  createPackageFile: createPackageFile,
  createContainerFolder: createContainerFolder,
  destroyContainerFolder: destroyContainerFolder,
  populateContainerFolder: populateContainerFolder
}
