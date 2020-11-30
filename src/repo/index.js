require("dotenv").config()

const fs = require("fs"),
      path = require("path");

const s3Connection = require("aws-sdk").S3

const config = require(appRoot + "/config")

const s3 = new s3Connection ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const getObject = (bucket, key) => {
  return s3.getObject({ Bucket: bucket, Key: key }).promise()
}

const getStream = (bucket, key) => {
  return s3.getObject({ Bucket: bucket, Key: key }).createReadStream()
}

const listBuckets = () => {
  return new Promise((resolve, reject) => {
    s3.listBuckets({}, (error, data) => {
      if (error) reject(error.message)
      resolve(data)
    })
  })
}

const readBucket = async (bucket) => {
  return new Promise((resolve, reject) => {
    s3.listObjects({ Bucket: bucket }, (error, data) => {
      if (error) reject(error.message)
      resolve(data)
    })
  })
}

const clearFolder = (bucket, folder_key) => {

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

const getTemplateManifest = async (params) => {

  const { branch, org_api } = params

  const bucket = config.aws.bucket.name,
        subfolder = config.aws.bucket.folders.manifest,
        file = `${subfolder}${branch}.json`;

  console.log(branch, bucket, subfolder, file, org_api)

  const results = await getObject(bucket, file),
        manifest = JSON.parse(results.Body.toString("utf-8"));



  return manifest
    .sort((a, b) => {
      if (a.template.label < b.template.label)
        return -1
      else if (a.template.label > b.template.label)
        return 1
      return 0
    })
    .map(item => {

    const template_key = item.s3.Key,
          template_api = parseInt(item.template.api_version),
          is_deployable = template_api <= org_api;

    item.template.deployable = is_deployable
    item.template.template_key = template_key

    return item

  })

}

const downloadAndDeployTemplate = async (conn, params) => {

  const { session, branch, template_keys } = params

  const bucket = config.aws.bucket.name,
        subfolder = config.aws.bucket.folders[branch];

  conn.metadata.pollInterval = 5 * 1000
  conn.metadata.pollTimeout = 300 * 1000

  return Promise.allSettled(
    template_keys.map(template => {

      return new Promise((resolve, reject) => {

        console.log(`Streaming ${template} to ${conn.instanceUrl}`)

        const zip_stream = getStream(bucket, template)

        zip_stream.on("error", (error) => {
          console.error(error)
          reject(error)
        })

        let deploy = conn.metadata.deploy(zip_stream, config.deploy_options)

        deploy.complete(true, (error, result) => {
          if (!error) {
            console.log(result)
            resolve(result)
          } else {
            console.error(error)
            reject(error)
          }
        })


      })

    })
  )

}

const uploadActivityLog = (fileName) => {

  const pass = new stream.PassThrough();

  const bucketName = "lowtide-logs",
        subFolder = "daily",
        fileKey = `${subFolder}/${fileName}`;

  const filePath = path.join(appRoot, "logs", fileName),
        fileData = fs.createReadStream(filePath, { encoding: "utf8" })

  const uploadParams = {
    Bucket: "lowtide-logs",
    Key: fileKey,
    Body: fileData
  }

  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, (error, data) => {
      if (error) reject(error)
      console.log(`${fileKey} uploaded to ${bucketName}/${subFolder}.`)
      resolve(data)
    })
  })

}


module.exports = {
  getObject: getObject,
  listBuckets: listBuckets,
  readBucket: readBucket,
  clearFolder: clearFolder,
  getTemplateManifest: getTemplateManifest,
  downloadAndDeployTemplate: downloadAndDeployTemplate,
  uploadActivityLog: uploadActivityLog
}
