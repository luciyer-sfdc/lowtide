require("dotenv").config()
const repo = require(appRoot + "/src/repo")

module.exports = async (is_master) => {

  try {

    console.log("Master?", is_master)

    const downloaded = await repo.github.downloadBranch(is_master)

    if (typeof downloaded === "boolean" && downloaded === true)
      console.log("Download and copy complete.")

    console.log(await repo.s3.clearFolder("beta/"))
    //await repo.s3.archiveAndUploadTemplate("beta", "CSV_Template")

  } catch (e) {
    console.error(e.message)
    return { success: false, errors: [ e.message ] }
  }

}
