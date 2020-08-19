require("dotenv").config()

const fsp = require("fs").promises,
      s3Connection = require("aws-sdk").S3,
      archiver = require("archiver");

const manifest = require("./manifest"),
      local = require("./staging_paths");


const bucket = process.env.S3_BUCKET_NAME || "ac-template-repo"

const s3 = new s3Connection ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const listBuckets = () => {
  return new Promise((resolve, reject) => {
    s3.listBuckets({}, (error, data) => {
      if (error) reject(error.message)
      resolve(data)
    })
  })
}

const readBucket = () => {
  return new Promise((resolve, reject) => {
    s3.listObjects({ Bucket: bucket }, (error, data) => {
      if (error) reject(error.message)
      resolve(data)
    })
  })
}

const clearFolder = (folder_key) => {
  return new Promise((resolve, reject) => {
    s3.listObjects({ Bucket: bucket, Prefix: folder_key }, (error, data) => {
      if (error)
        reject(error.message)

      if (data.Contents.length === 0)
        reject("Folder empty.")

      params = { Bucket: bucket, Delete: { Objects: [] }}

      data.Contents.forEach(item => {
        params.Delete.Objects.push({ Key: item.Key })
      })

      s3.deleteObjects(params, (error, data) => {
        if (error)
          reject(error.message)
        resolve(data)
      })

    })
  })
}

const archiveAndUploadTemplate = async (subfolder, template_name) => {

  if (subfolder !== "beta" && subfolder !== "master")
    throw new Error("Subfolder not recognized.")

  const zip_key = `${subfolder}/${template_name}.zip`

  const package = {
    file: "package.zip",
    manifest: "pkg/package.xml",
    templates: "pkg/waveTemplates/",
    static_resources: "pkg/staticresources/"
  }

  const archive = archiver("zip")

  archive.on("error", (error) => {
    throw new Error(error.message)
  })

  archive.on("finish", () => {
    console.log(`Archive created (${archive.pointer()} bytes).`)
  })

  archive.append(manifest.generate("49.0"), { name: package.manifest })
  archive.directory(local.static, package.static_resources)
  archive.directory(`${local[subfolder]}/${template_name}`, package.templates)

  archive.finalize()

  // Upload Archived Template

  s3.upload({ Bucket: bucket, Key: zip_key, Body: archive }, (error, data) => {
    if (error) throw error
    console.log(`${template_name} uploaded to ${subfolder}.`)
    return true
  })

}


module.exports = {
  listBuckets: listBuckets,
  readBucket: readBucket,
  clearFolder: clearFolder,
  archiveAndUploadTemplate: archiveAndUploadTemplate
}
