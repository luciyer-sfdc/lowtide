require("dotenv").config()

const fsp = require("fs").promises,
      copy = require("ncp").ncp,
      path = require("path"),
      pull = require("github-download");

const staging = require("./staging_paths")

const repo_remote = process.env.REPO_REMOTE || "https://github.com/ttse-sfdc/sfdc-ea-demo-templates.git",
      master_branch = process.env.REPO_MASTER_BRANCH || "master",
      beta_branch = process.env.REPO_BETA_BRANCH || "beta";

const repo = {
  remote: repo_remote,
  branches: {
    master: master_branch,
    beta: beta_branch
  },
  template_path: "/force-app/main/default/waveTemplates",
  static_path: "/force-app/main/default/staticresources"
}

const copyFolder = (source, dest) => {
  return new Promise((resolve, reject) => {
    copy(source, dest, (error) => {
      if (error) {
        console.error(error.message)
        reject(error.message)
        return
      } resolve()
    })
  })
}

const extToResource = async () => {

  const renamed_files = [],
        static_temp = staging.temp + repo.static_path,
        resources = await fsp.readdir(static_temp);

  await Promise.allSettled(resources.map(async resource => {

    const file_path = path.join(static_temp, resource),
          file_ext = path.extname(file_path);

    if (file_ext !== ".xml") {
      const new_file = path.basename(file_path, file_ext) + ".resource";
      const new_path = path.join(path.dirname(file_path), new_file)
      await fsp.rename(file_path, new_path)
      renamed_files.push({
        old: resource,
        current: path.basename(new_path) 
      })
    }

  }))

  return renamed_files
}

const clearFolder = (folder_path) => {
  console.log(`Clearing ${folder_path}.`)
  return fsp.rmdir(folder_path, { recursive: true })
}

exports.downloadBranch = async (is_master = false) => {

  let repo_branch = is_master ? "master" : "beta",
      target = is_master ? staging.master : staging.beta;

  console.log(`Updating ${target} from branch \"#${repo_branch}\"...`)

  await clearFolder(staging.temp)
    .catch(e => {
      console.error(e.message)
      return e.message
    })

  await clearFolder(staging.static)
    .catch(e => {
      console.error(e.message)
      return e.message
    })

  await clearFolder(target)
    .catch(e => {
      console.error(e.message)
      return e.message
    })

  return new Promise((resolve, reject) => {

    try {

      console.log(`Downloading #${repo_branch} to staging...`)

      pull(`${repo.remote}#${repo_branch}`, staging.temp)
        .on("zip", (zip_url) => {
          console.log("Request returned 403 (API limit reached).")
          console.log(`Retrieving zip from ${zip_url}.`)
        })
        .on("error", (e) => {
          console.error(e.message)
          reject(e.message)
        })
        .on("end", async () => {

          console.log(`#${repo_branch} downloaded to ${staging.temp}.\n`)

          console.log("Renamed", await extToResource())

          await copyFolder(staging.temp + repo.template_path, target)
          await copyFolder(staging.temp + repo.static_path, staging.static)

          await clearFolder(staging.temp)

          console.log(`Copied templates to ${target}.`)
          resolve(true)

        })

    } catch (e) {
      console.error(e.message)
      reject(e.message)
    }

  })

}
