require("dotenv").config()

const fsp = require("fs").promises
const aws = require("aws-sdk")

const bucket = process.env.S3_BUCKET_NAME || "ac-template-repo"

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const getFolderPath = (folder_name) => {

  const paths = {
    beta: "beta",
    master: "master",
    debug: "debug",
    staging: "staging",
    static: "static"
  }

  return bucket + paths[folder_name]

}

const uploadFile = (params) => {

/*
  const params = {
    Bucket: bucket,
    Key: file_name,
    Body: file_contents
  }
*/

  s3.upload(params, (err, data) => {
    if (err)
      throw err
    console.log(`File uploaded to S3.`)
  })


}
